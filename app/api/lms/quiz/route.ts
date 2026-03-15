export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function getUser(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
  if (!token) return null;
  const sb = supabase();
  const { data: { user }, error } = await sb.auth.getUser(token);
  if (error || !user) return null;
  const { data: profile } = await sb.from('profiles').select('id, email, role, company_id, full_name').eq('id', user.id).single();
  return profile ? { ...user, ...profile } : null;
}

// ═══════════════════════════════════════════════════════════
// GET — Load quiz for taking, or get attempt history
// ═══════════════════════════════════════════════════════════
export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sb = supabase();
  const view = req.nextUrl.searchParams.get('view') || 'load';
  const quizId = req.nextUrl.searchParams.get('quiz_id');
  const assignmentId = req.nextUrl.searchParams.get('assignment_id');

  try {
    switch (view) {
      case 'load': {
        // Load quiz questions for taking
        if (!quizId) return NextResponse.json({ error: 'quiz_id required' }, { status: 400 });
        const { data: quiz } = await sb.from('lms_quizzes').select('id, title, course_id, lms_courses(title, passing_score, course_type, equipment_type)').eq('id', quizId).single();
        if (!quiz) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
        const { data: questions } = await sb.from('lms_questions').select('id, question_text, question_type, options, sort_order').eq('quiz_id', quizId).order('sort_order');
        // Strip is_correct from options so employee can't cheat
        const safeQuestions = (questions || []).map((q: any) => ({
          ...q,
          options: (typeof q.options === 'string' ? JSON.parse(q.options) : q.options).map((o: any) => ({ text: o.text })),
        }));
        // Get previous attempts
        const { data: attempts } = await sb.from('lms_attempts').select('id, score, passed, completed_at').eq('quiz_id', quizId).eq('user_id', user.id).order('completed_at', { ascending: false }).limit(5);
        return NextResponse.json({ quiz, questions: safeQuestions, previousAttempts: attempts || [] });
      }

      case 'attempts': {
        // Get all attempts for this user on a quiz
        if (!quizId) return NextResponse.json({ error: 'quiz_id required' }, { status: 400 });
        const { data } = await sb.from('lms_attempts').select('*').eq('quiz_id', quizId).eq('user_id', user.id).order('completed_at', { ascending: false });
        return NextResponse.json({ attempts: data || [] });
      }

      default:
        return NextResponse.json({ error: 'Unknown view' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════
// POST — Submit quiz answers, grade, handle completion
// ═══════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sb = supabase();
  const body = await req.json();
  const { action } = body;

  try {
    switch (action) {
      case 'submit': {
        const { quizId, assignmentId, answers } = body;
        // answers = [{questionId, selectedIndex}]
        if (!quizId || !Array.isArray(answers)) return NextResponse.json({ error: 'quizId and answers[] required' }, { status: 400 });

        // Load questions with correct answers
        const { data: questions } = await sb.from('lms_questions').select('id, question_text, options, explanation').eq('quiz_id', quizId).order('sort_order');
        if (!questions || questions.length === 0) return NextResponse.json({ error: 'No questions found' }, { status: 404 });

        // Grade each answer
        let correct = 0;
        const gradedAnswers = questions.map((q: any) => {
          const opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
          const submission = answers.find((a: any) => a.questionId === q.id);
          const selectedIndex = submission?.selectedIndex ?? -1;
          const correctIndex = opts.findIndex((o: any) => o.is_correct);
          const isCorrect = selectedIndex === correctIndex;
          if (isCorrect) correct++;
          return {
            question_id: q.id,
            question_text: q.question_text,
            selected: selectedIndex,
            correct_index: correctIndex,
            is_correct: isCorrect,
            explanation: isCorrect ? null : q.explanation,
            correct_answer: isCorrect ? null : opts[correctIndex]?.text,
            selected_answer: selectedIndex >= 0 ? opts[selectedIndex]?.text : '(no answer)',
          };
        });

        const score = Math.round((correct / questions.length) * 100);
        const { data: quiz } = await sb.from('lms_quizzes').select('course_id, lms_courses(passing_score, course_type, equipment_type, cert_validity_months)').eq('id', quizId).single();
        const passingScore = (quiz as any)?.lms_courses?.passing_score || 100;
        const passed = score >= passingScore;

        // Record attempt
        const { data: attempt, error: attemptErr } = await sb.from('lms_attempts').insert({
          quiz_id: quizId, user_id: user.id, assignment_id: assignmentId || null,
          score, passed, answers: JSON.stringify(gradedAnswers),
          started_at: new Date().toISOString(), completed_at: new Date().toISOString(),
        }).select().single();
        if (attemptErr) return NextResponse.json({ error: attemptErr.message }, { status: 500 });

        const result: any = {
          success: true,
          attempt: attempt,
          score,
          passed,
          totalQuestions: questions.length,
          correctCount: correct,
          wrongCount: questions.length - correct,
        };

        if (passed) {
          // Update assignment status
          if (assignmentId) {
            await sb.from('lms_assignments').update({ status: 'completed' }).eq('id', assignmentId);
          }

          // Create completion record
          const courseId = (quiz as any)?.course_id;
          const { data: completion } = await sb.from('lms_completions').insert({
            user_id: user.id, course_id: courseId, assignment_id: assignmentId || null,
            score, completed_at: new Date().toISOString(),
          }).select().single();
          result.completion = completion;

          // Issue cert if equipment course
          const courseType = (quiz as any)?.lms_courses?.course_type;
          const equipType = (quiz as any)?.lms_courses?.equipment_type;
          if (courseType === 'equipment_cert' && equipType) {
            const validMonths = (quiz as any)?.lms_courses?.cert_validity_months || 24;
            const now = new Date();
            const expires = new Date(now);
            expires.setMonth(expires.getMonth() + validMonths);
            const certNum = 'WG-CERT-' + now.toISOString().slice(0,10).replace(/-/g,'') + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
            const { data: cert } = await sb.from('lms_certifications').insert({
              user_id: user.id, course_id: courseId, equipment_type: equipType,
              cert_number: certNum, issued_at: now.toISOString(), expires_at: expires.toISOString(),
              issued_by: user.id, delivery_method: 'email', delivery_status: 'pending', status: 'active',
            }).select().single();
            result.certification = cert;
            // Update completion with cert reference
            if (cert && completion) {
              await sb.from('lms_completions').update({ certificate_id: cert.id }).eq('id', completion.id);
            }
            // TODO: Send cert via Resend
          }

          result.message = 'Congratulations! You passed with ' + score + '%.';
        } else {
          // Show wrong answers with explanations
          result.wrongAnswers = gradedAnswers.filter((a: any) => !a.is_correct).map((a: any) => ({
            question: a.question_text,
            yourAnswer: a.selected_answer,
            correctAnswer: a.correct_answer,
            explanation: a.explanation,
          }));
          result.message = `You scored ${score}%. You need ${passingScore}% to pass. Review the ${result.wrongCount} incorrect answer(s) below and try again.`;
        }

        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

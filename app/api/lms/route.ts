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
// GET — Dashboard data, course lists, cert status
// ═══════════════════════════════════════════════════════════
export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sb = supabase();
  const view = req.nextUrl.searchParams.get('view') || 'dashboard';
  const dept = req.nextUrl.searchParams.get('dept') || null;
  const companyId = (user as any).company_id;

  try {
    switch (view) {
      case 'dashboard': {
        const [courses, assignments, certs, meetings] = await Promise.all([
          sb.from('lms_courses').select('*', { count: 'exact' }).eq('company_id', companyId).eq('status', 'active'),
          sb.from('lms_assignments').select('*, lms_courses(title, course_type, equipment_type)').eq('assigned_to', user.id).in('status', ['assigned', 'in_progress']),
          sb.from('lms_certifications').select('*, lms_courses(title, equipment_type)').eq('user_id', user.id).eq('status', 'active'),
          sb.from('lms_safety_meetings').select('*').eq('company_id', companyId).order('meeting_date', { ascending: false }).limit(5),
        ]);
        const expiringCerts = (certs.data || []).filter((c: any) => {
          const days = Math.ceil((new Date(c.expires_at).getTime() - Date.now()) / 86400000);
          return days <= 90 && days > 0;
        });
        return NextResponse.json({
          activeCourses: courses.count || 0,
          myAssignments: assignments.data || [],
          myCerts: certs.data || [],
          expiringCerts,
          recentMeetings: meetings.data || [],
        });
      }

      case 'courses': {
        let q = sb.from('lms_courses').select('*, lms_quizzes(id, title, status)').eq('company_id', companyId).order('created_at', { ascending: false });
        if (dept) q = q.eq('department', dept);
        const { data, error } = await q;
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ courses: data || [] });
      }

      case 'assignments': {
        const isManager = ['admin', 'super_admin', 'manager'].includes((user as any).role);
        let q;
        if (isManager) {
          q = sb.from('lms_assignments').select('*, lms_courses(title, course_type, equipment_type), profiles!lms_assignments_assigned_to_fkey(full_name, email)').eq('lms_courses.company_id', companyId).order('created_at', { ascending: false }).limit(100);
        } else {
          q = sb.from('lms_assignments').select('*, lms_courses(title, course_type, equipment_type)').eq('assigned_to', user.id).order('created_at', { ascending: false });
        }
        const { data } = await q;
        return NextResponse.json({ assignments: data || [] });
      }

      case 'certifications': {
        const userId = req.nextUrl.searchParams.get('user_id') || user.id;
        const { data } = await sb.from('lms_certifications').select('*, lms_courses(title, equipment_type)').eq('user_id', userId).order('issued_at', { ascending: false });
        return NextResponse.json({ certifications: data || [] });
      }

      case 'meetings': {
        const { data } = await sb.from('lms_safety_meetings').select('*, lms_attendance(user_id, attended, signed_at)').eq('company_id', companyId).order('meeting_date', { ascending: false }).limit(30);
        return NextResponse.json({ meetings: data || [] });
      }

      case 'completions': {
        const { data } = await sb.from('lms_completions').select('*, lms_courses(title, course_type), lms_certifications(cert_number, status)').eq('user_id', user.id).order('completed_at', { ascending: false });
        return NextResponse.json({ completions: data || [] });
      }

      case 'sops': {
        const { data } = await sb.from('lms_sop_documents').select('*').eq('company_id', companyId).eq('status', 'active').order('created_at', { ascending: false });
        return NextResponse.json({ sops: data || [] });
      }

      default:
        return NextResponse.json({ error: 'Unknown view. Use: dashboard, courses, assignments, certifications, meetings, completions, sops' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════
// POST — Course management, assignments, certs, meetings, AI
// ═══════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sb = supabase();
  const body = await req.json();
  const { action } = body;
  const companyId = (user as any).company_id;

  // AI actions require auth (already checked above)
  try {
    switch (action) {
      // ── COURSE MANAGEMENT ────────────────────────────────
      case 'create-course': {
        const { title, description, department, courseType, equipmentType, certValidityMonths, passingScore } = body;
        if (!title || !department) return NextResponse.json({ error: 'title and department required' }, { status: 400 });
        const { data, error } = await sb.from('lms_courses').insert({
          company_id: companyId, department, title, description,
          course_type: courseType || 'custom',
          equipment_type: equipmentType || null,
          cert_validity_months: certValidityMonths || 24,
          passing_score: passingScore || 100,
          created_by: user.id, status: 'draft',
        }).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, course: data });
      }

      case 'activate-course': {
        const { courseId } = body;
        const { error } = await sb.from('lms_courses').update({ status: 'active', updated_at: new Date().toISOString() }).eq('id', courseId);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      // ── QUIZ MANAGEMENT ──────────────────────────────────
      case 'create-quiz': {
        const { courseId, title, questions } = body;
        if (!courseId || !title) return NextResponse.json({ error: 'courseId and title required' }, { status: 400 });
        const { data: quiz, error: qErr } = await sb.from('lms_quizzes').insert({
          course_id: courseId, title, status: 'draft',
        }).select().single();
        if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });
        if (questions && Array.isArray(questions) && questions.length > 0) {
          const rows = questions.map((q: any, i: number) => ({
            quiz_id: quiz.id, question_text: q.question, question_type: q.type || 'multiple_choice',
            options: JSON.stringify(q.options || []), explanation: q.explanation || null, sort_order: i,
          }));
          await sb.from('lms_questions').insert(rows);
        }
        return NextResponse.json({ success: true, quiz });
      }

      case 'activate-quiz': {
        const { quizId } = body;
        const { error } = await sb.from('lms_quizzes').update({ status: 'active' }).eq('id', quizId);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      // ── ASSIGNMENTS ──────────────────────────────────────
      case 'assign-course': {
        const { courseId, userIds, dueDate, reason } = body;
        if (!courseId || !Array.isArray(userIds)) return NextResponse.json({ error: 'courseId and userIds[] required' }, { status: 400 });
        const rows = userIds.map((uid: string) => ({
          course_id: courseId, assigned_to: uid, assigned_by: user.id,
          due_date: dueDate || null, reason: reason || 'scheduled', status: 'assigned',
        }));
        const { error } = await sb.from('lms_assignments').insert(rows);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, assigned: userIds.length });
      }

      // ── CERTIFICATIONS ───────────────────────────────────
      case 'issue-cert': {
        const { userId, courseId, equipmentType, deliveryMethod } = body;
        if (!userId || !courseId) return NextResponse.json({ error: 'userId and courseId required' }, { status: 400 });
        const { data: course } = await sb.from('lms_courses').select('cert_validity_months').eq('id', courseId).single();
        const validMonths = course?.cert_validity_months || 24;
        const now = new Date();
        const expires = new Date(now);
        expires.setMonth(expires.getMonth() + validMonths);
        const certNum = 'WG-CERT-' + now.toISOString().slice(0,10).replace(/-/g,'') + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        const { data, error } = await sb.from('lms_certifications').insert({
          user_id: userId, course_id: courseId, equipment_type: equipmentType || null,
          cert_number: certNum, issued_at: now.toISOString(), expires_at: expires.toISOString(),
          issued_by: user.id, delivery_method: deliveryMethod || 'email',
          delivery_status: 'pending', status: 'active',
        }).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        // TODO: Send cert via Resend email/SMS
        return NextResponse.json({ success: true, certification: data });
      }

      case 'revoke-cert': {
        const { certId, reason } = body;
        const { error } = await sb.from('lms_certifications').update({
          status: 'revoked', revoked_at: new Date().toISOString(), revoke_reason: reason || 'admin',
        }).eq('id', certId);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, message: 'Certificate revoked' });
      }

      case 'accident-recert': {
        const { userId, courseId, equipmentType } = body;
        // Revoke existing cert
        await sb.from('lms_certifications').update({
          status: 'revoked', revoked_at: new Date().toISOString(), revoke_reason: 'accident',
        }).eq('user_id', userId).eq('course_id', courseId).eq('status', 'active');
        // Create new assignment
        const { data, error } = await sb.from('lms_assignments').insert({
          course_id: courseId, assigned_to: userId, assigned_by: user.id,
          reason: 'accident_recert', status: 'assigned',
        }).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, assignment: data, message: 'Cert revoked. Recertification assigned.' });
      }

      // ── SAFETY MEETINGS ──────────────────────────────────
      case 'create-meeting': {
        const { title, topic, content, meetingDate, durationMinutes } = body;
        if (!title || !meetingDate) return NextResponse.json({ error: 'title and meetingDate required' }, { status: 400 });
        const { data, error } = await sb.from('lms_safety_meetings').insert({
          company_id: companyId, title, topic, content,
          meeting_date: meetingDate, duration_minutes: durationMinutes || 15,
          generated_by: 'manual', created_by: user.id, status: 'scheduled',
        }).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, meeting: data });
      }

      case 'record-attendance': {
        const { meetingId, attendees } = body;
        if (!meetingId || !Array.isArray(attendees)) return NextResponse.json({ error: 'meetingId and attendees[] required' }, { status: 400 });
        const rows = attendees.map((a: any) => ({
          meeting_id: meetingId, user_id: a.userId, attended: a.attended !== false,
          signed_at: a.attended !== false ? new Date().toISOString() : null, notes: a.notes || null,
        }));
        const { error } = await sb.from('lms_attendance').upsert(rows, { onConflict: 'meeting_id,user_id' });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        await sb.from('lms_safety_meetings').update({ status: 'completed' }).eq('id', meetingId);
        return NextResponse.json({ success: true, recorded: attendees.length });
      }

      // ── AI ACTIONS ───────────────────────────────────────
      case 'generate-safety-meeting': {
        const { topic } = body;
        const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
        const r = await openai.chat.completions.create({
          model: 'gpt-4o-mini', temperature: 0.3, max_tokens: 1000,
          messages: [
            { role: 'system', content: 'You are a warehouse safety training expert. Generate a 10-15 minute toolbox talk for a daily safety meeting. Include: 1) Opening safety moment, 2) Main topic with specific warehouse examples, 3) Key takeaways (3-5 bullet points), 4) Discussion questions for the crew, 5) Safety reminder of the day. Be practical, specific to warehouse/3PL operations, and reference OSHA standards where relevant.' },
            { role: 'user', content: `Generate a daily safety meeting on: ${topic || 'General warehouse safety'}` },
          ],
        });
        const content = r.choices[0]?.message?.content || '';
        const { data, error } = await sb.from('lms_safety_meetings').insert({
          company_id: companyId, title: `Daily Safety: ${topic || 'General'}`, topic,
          content, meeting_date: new Date().toISOString().slice(0, 10),
          generated_by: 'ai', created_by: user.id, status: 'scheduled',
        }).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, meeting: data, content });
      }

      case 'generate-quiz-from-sop': {
        const { sopId, courseId, numQuestions } = body;
        const { data: sop } = await sb.from('lms_sop_documents').select('title, ai_summary').eq('id', sopId).single();
        if (!sop) return NextResponse.json({ error: 'SOP not found' }, { status: 404 });
        const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
        const r = await openai.chat.completions.create({
          model: 'gpt-4o-mini', temperature: 0.3, max_tokens: 2000,
          messages: [
            { role: 'system', content: 'You are a training quiz generator for warehouse operations. Generate multiple-choice quiz questions from the provided SOP content. Each question must have exactly 4 options with 1 correct answer. Include an explanation for each correct answer. Return ONLY valid JSON array.' },
            { role: 'user', content: `Generate ${numQuestions || 10} quiz questions from this SOP:\n\nTitle: ${sop.title}\nContent: ${sop.ai_summary || 'No summary available'}\n\nReturn JSON array: [{"question":"...","options":[{"text":"...","is_correct":true},{"text":"...","is_correct":false},...], "explanation":"..."}]` },
          ],
        });
        let questions: any[] = [];
        try {
          const raw = r.choices[0]?.message?.content || '[]';
          questions = JSON.parse(raw.replace(/```json|```/g, '').trim());
        } catch { return NextResponse.json({ error: 'AI returned invalid quiz format' }, { status: 500 }); }
        // Create quiz + questions
        const { data: quiz } = await sb.from('lms_quizzes').insert({
          course_id: courseId, title: `Quiz: ${sop.title}`, status: 'draft',
        }).select().single();
        if (quiz && questions.length > 0) {
          const rows = questions.map((q: any, i: number) => ({
            quiz_id: quiz.id, question_text: q.question, question_type: 'multiple_choice',
            options: JSON.stringify(q.options), explanation: q.explanation || null, sort_order: i,
          }));
          await sb.from('lms_questions').insert(rows);
        }
        return NextResponse.json({ success: true, quiz, questionCount: questions.length });
      }

      case 'summarize-sop': {
        const { sopId } = body;
        const { data: sop } = await sb.from('lms_sop_documents').select('*').eq('id', sopId).single();
        if (!sop) return NextResponse.json({ error: 'SOP not found' }, { status: 404 });
        const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
        const r = await openai.chat.completions.create({
          model: 'gpt-4o-mini', temperature: 0.3, max_tokens: 1000,
          messages: [
            { role: 'system', content: 'You are a warehouse SOP analyst. Summarize this Standard Operating Procedure into key steps, safety requirements, and critical checkpoints. Be concise and actionable.' },
            { role: 'user', content: `Summarize SOP: ${sop.title}. File: ${sop.file_path}` },
          ],
        });
        const summary = r.choices[0]?.message?.content || '';
        await sb.from('lms_sop_documents').update({ ai_summary: summary }).eq('id', sopId);
        return NextResponse.json({ success: true, summary });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

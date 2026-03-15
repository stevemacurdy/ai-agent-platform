'use client';
import { useState, useEffect } from 'react';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: { text: string }[];
  sort_order: number;
}

interface QuizResult {
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  message: string;
  wrongAnswers?: { question: string; yourAnswer: string; correctAnswer: string; explanation: string }[];
  certification?: { cert_number: string; equipment_type: string; expires_at: string };
}

interface Props {
  quizId: string;
  assignmentId?: string;
  onComplete?: (result: QuizResult) => void;
  onBack?: () => void;
}

export default function QuizRenderer({ quizId, assignmentId, onComplete, onBack }: Props) {
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [previousAttempts, setPreviousAttempts] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('woulfai_token') || '';
    fetch(`/api/lms/quiz?view=load&quiz_id=${quizId}`, {
      headers: { 'Authorization': 'Bearer ' + token },
    }).then(r => r.json()).then(d => {
      setQuiz(d.quiz);
      setQuestions(d.questions || []);
      setPreviousAttempts(d.previousAttempts || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [quizId]);

  const handleSelect = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const token = localStorage.getItem('woulfai_token') || '';
    const payload = {
      action: 'submit',
      quizId,
      assignmentId: assignmentId || null,
      answers: questions.map(q => ({
        questionId: q.id,
        selectedIndex: answers[q.id] ?? -1,
      })),
    };
    try {
      const res = await fetch('/api/lms/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResult(data);
      if (onComplete) onComplete(data);
    } catch (err) {
      setResult({ score: 0, passed: false, totalQuestions: questions.length, correctCount: 0, wrongCount: questions.length, message: 'Submission failed. Please try again.' });
    }
    setSubmitting(false);
  };

  const handleRetry = () => {
    setResult(null);
    setAnswers({});
    setCurrentQ(0);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-[#2A9D8F] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!quiz || questions.length === 0) return (
    <div className="text-center py-12">
      <p className="text-[#6B7280]">Quiz not found or has no questions.</p>
      {onBack && <button onClick={onBack} className="mt-4 text-[#2A9D8F] hover:underline text-sm">Go Back</button>}
    </div>
  );

  // ── RESULT SCREEN ──
  if (result) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className={`rounded-xl p-6 mb-6 ${result.passed ? 'bg-emerald-50 border border-emerald-200' : 'bg-rose-50 border border-rose-200'}`}>
          <div className="text-center mb-4">
            <div className={`text-5xl mb-2 ${result.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
              {result.passed ? '\u2713' : '\u2717'}
            </div>
            <h2 className={`text-2xl font-bold ${result.passed ? 'text-emerald-800' : 'text-rose-800'}`}>
              {result.passed ? 'Passed!' : 'Not Yet'}
            </h2>
            <p className="text-3xl font-bold mt-2">{result.score}%</p>
            <p className="text-sm text-[#6B7280] mt-1">{result.correctCount} of {result.totalQuestions} correct</p>
          </div>
          <p className="text-center text-sm text-[#4B5563]">{result.message}</p>
          {result.certification && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-emerald-300 text-center">
              <p className="text-sm font-semibold text-emerald-700">Certificate Issued</p>
              <p className="text-lg font-mono font-bold text-[#1B2A4A] mt-1">{result.certification.cert_number}</p>
              <p className="text-xs text-[#6B7280] mt-1">
                {result.certification.equipment_type} | Expires: {new Date(result.certification.expires_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {!result.passed && result.wrongAnswers && result.wrongAnswers.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[#1B2A4A] mb-3">Review Incorrect Answers:</h3>
            <div className="space-y-3">
              {result.wrongAnswers.map((wa, i) => (
                <div key={i} className="bg-white rounded-lg border border-rose-200 p-4">
                  <p className="text-sm font-medium text-[#1B2A4A] mb-2">{wa.question}</p>
                  <div className="flex gap-4 text-xs mb-2">
                    <span className="text-rose-600">Your answer: {wa.yourAnswer}</span>
                    <span className="text-emerald-600">Correct: {wa.correctAnswer}</span>
                  </div>
                  {wa.explanation && (
                    <p className="text-xs text-[#6B7280] bg-gray-50 rounded p-2">{wa.explanation}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {!result.passed && (
            <button onClick={handleRetry} className="flex-1 py-3 bg-[#1B2A4A] text-white rounded-lg text-sm font-medium hover:bg-[#1B2A4A]/90 transition-colors">
              Retry Quiz
            </button>
          )}
          {onBack && (
            <button onClick={onBack} className="flex-1 py-3 bg-gray-100 text-[#4B5563] rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
              Back to Courses
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── QUIZ SCREEN ──
  const q = questions[currentQ];
  const allAnswered = questions.every(q => answers[q.id] !== undefined);
  const progress = Object.keys(answers).length / questions.length * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#1B2A4A]">{quiz.title}</h2>
          <p className="text-xs text-[#6B7280]">{(quiz as any).lms_courses?.title} | Must score 100% to pass</p>
        </div>
        {previousAttempts.length > 0 && (
          <div className="text-right">
            <p className="text-xs text-[#6B7280]">Previous: {previousAttempts.length} attempt(s)</p>
            <p className="text-xs text-[#6B7280]">Best: {Math.max(...previousAttempts.map((a: any) => a.score))}%</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div className="bg-[#2A9D8F] h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 mb-4">
        <p className="text-xs text-[#6B7280] mb-2">Question {currentQ + 1} of {questions.length}</p>
        <p className="text-base font-medium text-[#1B2A4A] mb-4">{q.question_text}</p>
        <div className="space-y-2">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelect(q.id, i)}
              className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${
                answers[q.id] === i
                  ? 'border-[#2A9D8F] bg-[#2A9D8F]/10 text-[#1B2A4A] font-medium'
                  : 'border-[#E5E7EB] hover:border-[#2A9D8F]/50 text-[#4B5563]'
              }`}
            >
              <span className="inline-block w-6 h-6 rounded-full border mr-2 text-center text-xs leading-6 font-medium" style={{
                borderColor: answers[q.id] === i ? '#2A9D8F' : '#D1D5DB',
                backgroundColor: answers[q.id] === i ? '#2A9D8F' : 'transparent',
                color: answers[q.id] === i ? '#fff' : '#6B7280',
              }}>
                {String.fromCharCode(65 + i)}
              </span>
              {opt.text}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
          disabled={currentQ === 0}
          className="px-4 py-2 text-sm text-[#6B7280] hover:text-[#1B2A4A] disabled:opacity-30 transition-colors"
        >
          Previous
        </button>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              className={`w-7 h-7 rounded-full text-xs font-medium transition-all ${
                i === currentQ ? 'bg-[#1B2A4A] text-white' :
                answers[questions[i].id] !== undefined ? 'bg-[#2A9D8F] text-white' : 'bg-gray-200 text-[#6B7280]'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        {currentQ < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQ(currentQ + 1)}
            className="px-4 py-2 text-sm text-[#2A9D8F] font-medium hover:underline transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className="px-6 py-2 bg-[#2A9D8F] text-white text-sm font-medium rounded-lg hover:bg-[#2A9D8F]/90 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Grading...' : 'Submit'}
          </button>
        )}
      </div>
    </div>
  );
}

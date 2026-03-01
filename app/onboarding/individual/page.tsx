'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { ArrowRight, CheckCircle2, User, Sparkles, Send } from 'lucide-react';

interface FollowUp {
  question: string;
  answer: string;
}

// Keyword-based follow-up generation (no AI call needed for MVP)
function generateFollowUps(text: string): string[] {
  const lower = text.toLowerCase();
  const questions: string[] = [];

  if (lower.match(/sales|crm|pipeline|lead|prospect|close/)) {
    questions.push('How large is your sales team, and what CRM do you currently use (if any)?');
    questions.push('What does your typical sales cycle look like — how long from first contact to close?');
  }
  if (lower.match(/warehouse|inventory|wms|fulfillment|shipping|logistics|3pl/)) {
    questions.push('How many SKUs do you manage, and what volume of orders do you process daily?');
    questions.push('Are you using any warehouse management software currently, or mostly spreadsheets?');
  }
  if (lower.match(/finance|accounting|invoice|payment|cash|budget|report/)) {
    questions.push('What accounting software do you use (QuickBooks, Xero, SAP, etc.)?');
    questions.push('What financial reports or processes take up the most time each month?');
  }
  if (lower.match(/hr|hiring|employee|onboard|payroll|team/)) {
    questions.push('How many employees are you managing, and what HR tools do you currently use?');
    questions.push('What part of the hiring or onboarding process is most painful right now?');
  }
  if (lower.match(/market|seo|content|social|ad|brand|growth/)) {
    questions.push('What marketing channels are you currently active on?');
    questions.push('Do you have a content strategy in place, or are you starting from scratch?');
  }
  if (lower.match(/automat|efficienc|process|workflow|manual|repetit/)) {
    questions.push('Which manual processes eat up the most of your time each week?');
    questions.push('Have you tried any automation tools before? What worked or didn\'t?');
  }
  if (lower.match(/compliance|legal|regulation|audit|risk/)) {
    questions.push('What industry regulations do you need to stay compliant with?');
    questions.push('How do you currently track compliance — manually or with specific software?');
  }

  // Always add a general one if we got less than 2
  if (questions.length < 2) {
    questions.push('What does a typical day look like for you, and where do you feel the most friction?');
    questions.push('If you could wave a magic wand and fix one thing in your business, what would it be?');
  }

  // Return max 3
  return questions.slice(0, 3);
}

export default function IndividualOnboarding() {
  const router = useRouter();
  const [phase, setPhase] = useState<'intro' | 'followup' | 'done'>('intro');
  const [mainText, setMainText] = useState('');
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [currentFollowUp, setCurrentFollowUp] = useState(0);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const load = async () => {
      const sb = getSupabaseBrowser();
      const { data: { session } } = await sb.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || '');
        setUserName(session.user.user_metadata?.full_name || '');
      }
    };
    load();
  }, []);

  const handleInitialSubmit = () => {
    if (!mainText.trim()) return;
    const questions = generateFollowUps(mainText);
    setFollowUps(questions.map(q => ({ question: q, answer: '' })));
    setPhase('followup');
  };

  const updateFollowUpAnswer = (idx: number, val: string) => {
    setFollowUps(prev => prev.map((f, i) => i === idx ? { ...f, answer: val } : f));
  };

  const handleNextFollowUp = () => {
    if (currentFollowUp < followUps.length - 1) {
      setCurrentFollowUp(c => c + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const sb = getSupabaseBrowser();
      const { data: { session } } = await sb.auth.getSession();
      const token = session?.access_token;

      const responses = {
        initial_description: mainText,
        follow_ups: followUps.map(f => ({ question: f.question, answer: f.answer })),
      };

      // Save onboarding record
      await fetch('/api/onboarding/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
        },
        body: JSON.stringify({
          user_type: 'individual',
          responses,
          completed: true,
        }),
      });

      // Create a lead
      const followUpSummary = followUps
        .filter(f => f.answer.trim())
        .map(f => `Q: ${f.question} A: ${f.answer}`)
        .join('. ');

      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName,
          email: userEmail,
          source: 'registration',
          interest: 'individual',
          message: `${mainText}. ${followUpSummary}`,
        }),
      });

      setPhase('done');
      setTimeout(() => router.push('/portal'), 2000);
    } catch (err) {
      console.error('Onboarding save error:', err);
      router.push('/portal');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-500/20 rounded-full text-xs text-purple-600 mb-4">
            <User className="w-3 h-3" />
            Individual Onboarding
          </div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] mb-2">
            {phase === 'intro' && "Tell us what you're looking for"}
            {phase === 'followup' && "Just a couple follow-ups"}
            {phase === 'done' && "You're all set!"}
          </h1>
          <p className="text-sm text-[#9CA3AF]">
            {phase === 'intro' && "The more detail you share, the better we can match you with the right AI Employees."}
            {phase === 'followup' && "Based on what you shared, these will help us serve you better."}
            {phase === 'done' && "Taking you to your portal now..."}
          </p>
        </div>

        {/* Phase: Intro - Free text */}
        {phase === 'intro' && (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-[#4B5563] leading-relaxed">
                  Hi{userName ? ` ${userName.split(' ')[0]}` : ''}! I&apos;d love to learn about what brought you here.
                  Tell me about your work, the challenges you&apos;re facing, or what you&apos;d like AI to help you with.
                  There&apos;s no wrong answer — just speak freely.
                </p>
              </div>
            </div>

            <textarea
              value={mainText}
              onChange={e => setMainText(e.target.value)}
              placeholder="I'm looking for help with..."
              rows={6}
              className="w-full px-4 py-3 bg-white border border-[#E5E7EB] shadow-sm rounded-xl text-sm text-[#1B2A4A] placeholder:text-[#6B7280] focus:border-purple-500 focus:outline-none resize-none mt-4"
              autoFocus
            />

            <div className="flex items-center justify-between mt-6">
              <span className="text-[10px] text-[#6B7280]">
                {mainText.length > 0 ? `${mainText.split(/\s+/).filter(Boolean).length} words` : 'Start typing...'}
              </span>
              <button
                onClick={handleInitialSubmit}
                disabled={mainText.trim().length < 10}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-500 transition disabled:opacity-40"
              >
                Continue <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Phase: Follow-ups */}
        {phase === 'followup' && (
          <div className="space-y-4">
            {/* Progress */}
            <div className="flex gap-1.5 mb-6">
              {followUps.map((_, i) => (
                <div
                  key={i}
                  className={"h-1.5 flex-1 rounded-full transition-all duration-300 " +
                    (i < currentFollowUp ? 'bg-purple-500' : i === currentFollowUp ? 'bg-purple-400' : 'bg-gray-100')}
                />
              ))}
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm text-[#4B5563] leading-relaxed">
                  {followUps[currentFollowUp]?.question}
                </p>
              </div>

              <textarea
                value={followUps[currentFollowUp]?.answer || ''}
                onChange={e => updateFollowUpAnswer(currentFollowUp, e.target.value)}
                placeholder="Your answer..."
                rows={3}
                className="w-full px-4 py-3 bg-white border border-[#E5E7EB] shadow-sm rounded-xl text-sm text-[#1B2A4A] placeholder:text-[#6B7280] focus:border-purple-500 focus:outline-none resize-none mt-2"
                autoFocus
                key={currentFollowUp}
              />

              <div className="flex items-center justify-between mt-6">
                <span className="text-[10px] text-[#6B7280]">
                  Question {currentFollowUp + 1} of {followUps.length}
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={handleNextFollowUp}
                    className="text-xs text-[#9CA3AF] hover:text-[#4B5563] transition"
                  >
                    {followUps[currentFollowUp]?.answer.trim() ? '' : 'Skip'}
                  </button>
                  <button
                    onClick={handleNextFollowUp}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-500 transition"
                  >
                    {currentFollowUp < followUps.length - 1 ? (
                      <>Next <ArrowRight className="w-4 h-4" /></>
                    ) : (
                      <>{saving ? 'Saving...' : 'Complete'} <CheckCircle2 className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Phase: Done */}
        {phase === 'done' && (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-[#1B2A4A] mb-2">Welcome aboard!</h2>
            <p className="text-sm text-[#6B7280]">
              We&apos;ve got everything we need. Taking you to your portal now...
            </p>
          </div>
        )}

        {/* Skip */}
        {phase !== 'done' && (
          <div className="text-center mt-6">
            <button onClick={() => router.push('/portal')} className="text-xs text-[#6B7280] hover:text-[#6B7280] transition">
              Skip for now — I&apos;ll explore on my own
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { trackUsage } from '@/lib/usage-tracker';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

const SYSTEM_PROMPT = `You are the WoulfAI Sales Coach — the world's most effective AI sales mentor. You combine the methodology of Sandler Selling, SPIN Selling, Challenger Sale, and Tony Robbins' influence techniques into a personalized coaching experience.

YOUR ROLE:
You debrief salespeople after every call, meeting, or interaction. You help them improve by asking the RIGHT questions — not lecturing. You're like a great coach: supportive but direct, never letting them off the hook, always pushing for growth.

YOUR COACHING METHODOLOGY:

PHASE 1 — CALL DEBRIEF (first 3-4 messages)
Start by understanding what happened:
- "Walk me through the call. Who did you talk to, what's their role, and what was the purpose?"
- "What was the outcome? Where did you leave things?"
- "On a scale of 1-10, how do you think it went? Why that number?"

PHASE 2 — DEEP ANALYSIS (messages 4-7)
Dig into the critical moments:
- "What was the strongest moment in the conversation? When did you feel most in control?"
- "Was there a moment where you felt the energy shift or you lost them? What happened right before that?"
- "Did you uncover their REAL pain — the thing that keeps them up at night — or just surface-level problems?"
- "Did you establish a clear next step with a specific date and time, or was it vague?"
- "Who else is involved in the decision? Did you ask about their decision-making process?"

PHASE 3 — PATTERN RECOGNITION (messages 7-9)
Help them see their patterns:
- If they talk too much: "It sounds like you did a lot of the talking. What percentage would you say was you vs them? The goal is 30/70."
- If they didn't qualify: "Did you find out their budget, timeline, and authority? If not, what stopped you from asking?"
- If they pitched too early: "It sounds like you went into solution mode before fully understanding the problem. What made you feel the need to pitch?"
- If they didn't close: "What stopped you from asking for the next step directly? Was it fear of rejection or something else?"

PHASE 4 — COACHING & ACTION (messages 9+)
Give specific, actionable coaching:
- Give them ONE thing to focus on for their next call (not five things)
- Role-play: "Let's practice. I'll be the prospect. When I say [objection], what do you say?"
- Reframe their thinking: "Instead of thinking 'I need to convince them,' think 'I need to understand if we can help them.'"
- Build their confidence: acknowledge what they did well FIRST, then coach on improvements

PERSONALITY PROFILING:
As you talk with the salesperson, profile them:
- Are they a HUNTER (loves prospecting, high energy) or FARMER (loves relationships, nurturing)?
- Are they CONFIDENT or UNCERTAIN in their selling?
- Do they tend to TALK TOO MUCH or ask good questions?
- Do they FEAR REJECTION or handle it well?
- Are they STRATEGIC or REACTIVE in their selling approach?
Adapt your coaching style to their personality. Be more encouraging with uncertain sellers, more challenging with overconfident ones.

SALES FRAMEWORKS YOU REFERENCE:
- SPIN: Situation, Problem, Implication, Need-payoff questions
- Sandler: Pain, Budget, Decision (in that order)
- Challenger: Teach-Tailor-Take Control
- MEDDIC: Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion

RULES:
- Ask ONE question at a time. Let them talk.
- Keep responses 2-4 sentences. Be punchy, not preachy.
- Use their name once you know it
- Never be condescending — you're their coach, not their boss
- Be specific: "Tell me exactly what you said when they brought up price" not "How did you handle objections?"
- Celebrate wins genuinely: "That's a strong move. Most reps don't think to ask that."
- Push them: "I'm going to be honest — that sounds like a missed opportunity. Here's why..."
- End sessions with a clear action item and encouragement
- If they share a recording transcript, analyze it in detail
- Track their progress over time if they mention previous coaching sessions`;

export async function POST(request: NextRequest) {
  try {
    trackUsage(request, 'sales-coach', 'chat');
    const { messages, session_id, rep_name } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages array required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 500 });
    }

    const sb = supabaseAdmin();

    // Create or get session
    let currentSessionId = session_id;
    if (!currentSessionId) {
      const { data: session } = await sb.from('chat_sessions').insert({
        source: 'sales_coach',
        status: 'active',
        visitor_name: rep_name || null,
      }).select().single();
      currentSessionId = session?.id;
    }

    // Save user message
    const lastUserMsg = messages[messages.length - 1];
    if (currentSessionId && lastUserMsg?.role === 'user') {
      await sb.from('chat_messages').insert({
        session_id: currentSessionId,
        role: 'user',
        content: lastUserMsg.content,
      });
    }

    // Personality analysis after 5+ user messages
    const userMsgCount = messages.filter((m: any) => m.role === 'user').length;
    let personalityInsight = '';
    if (userMsgCount >= 5) {
      const allUserText = messages.filter((m: any) => m.role === 'user').map((m: any) => m.content).join('\n');
      try {
        const profileRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'Analyze this salesperson based on their coaching debrief. Return JSON: {"type":"hunter|farmer","confidence":"high|medium|low","talk_ratio":"talks_too_much|balanced|good_listener","rejection_handling":"fears_rejection|handles_well","approach":"strategic|reactive","key_strength":"...","key_weakness":"...","one_thing_to_improve":"..."}' },
              { role: 'user', content: allUserText },
            ],
            max_tokens: 200,
            temperature: 0.3,
          }),
        });
        const profileData = await profileRes.json();
        const profileText = profileData.choices?.[0]?.message?.content || '';
        personalityInsight = '\n\n[INTERNAL PROFILE - use to adapt your coaching style, do not share directly: ' + profileText + ']';

        // Save profile to session
        if (currentSessionId) {
          try {
            const profile = JSON.parse(profileText.replace(/```json|```/g, '').trim());
            await sb.from('chat_sessions').update({ personality_profile: profile }).eq('id', currentSessionId);
          } catch {}
        }
      } catch {}
    }

    // Build conversation
    const openaiMessages = [
      { role: 'system', content: SYSTEM_PROMPT + personalityInsight },
      ...messages.map((m: any) => ({ role: m.role, content: m.content })),
    ];

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: openaiMessages,
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "Let's get started. Walk me through your last call — who'd you talk to and how did it go?";

    // Save assistant message
    if (currentSessionId) {
      await sb.from('chat_messages').insert({
        session_id: currentSessionId,
        role: 'assistant',
        content: reply,
      });
    }

    return NextResponse.json({ reply, session_id: currentSessionId });
  } catch (err: any) {
    console.error('Sales coach error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

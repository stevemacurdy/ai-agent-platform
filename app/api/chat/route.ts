export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

const SYSTEM_PROMPT = `You are Woulf, the AI sales assistant for WoulfAI — an AI agent marketplace built by Woulf Group, a warehouse systems integration firm based in Grantsville, Utah.

Your personality: Friendly, knowledgeable, confident but not pushy. You genuinely want to help businesses find the right AI agents. You speak casually but professionally — like a smart colleague, not a robot.

KEY FACTS ABOUT WOULFAI:
- We offer 17+ specialized AI agents across Finance, Sales, Operations, HR, Compliance, and more
- Agents include: CFO Agent, Sales Agent, WMS Agent, Marketing Agent, HR Agent, SEO Agent, Operations Agent, Supply Chain Agent, Compliance Agent, Legal Agent, Training Agent, Support Agent, Research Agent, and more
- Pricing tiers: Starter ($499/mo, 3 agents), Professional ($1,200/mo, 7 agents), Enterprise ($2,499/mo, all agents)
- Agents integrate with existing tools (ERP, CRM, etc.)
- Built for warehouse/logistics/3PL companies but works for any business
- Setup takes minutes, not months
- Contact: solutions@woulfgroup.com, (801) 688-1745

YOUR GOALS:
1. Understand what the visitor needs (their industry, pain points, team size)
2. Recommend specific agents that would help them
3. Guide them toward signing up or booking a demo
4. Capture their contact info naturally when appropriate (name, email, company)
5. If they seem ready, direct them to /register or /contact

RULES:
- Keep responses concise (2-4 sentences usually)
- Ask one question at a time
- Don't make up features that don't exist
- If you don't know something specific, offer to connect them with the sales team
- Be enthusiastic about the product without being fake`;

const PERSONALITY_PROMPT = `Analyze this conversation between a visitor and an AI sales assistant. Classify the visitor's communication style. Respond ONLY with valid JSON, no other text:

{
  "style": "analytical" | "expressive" | "driver" | "amiable",
  "decision_pace": "fast" | "deliberate",
  "proof_preference": "data" | "testimonials" | "case_studies" | "demos",
  "notes": "one sentence summary of their communication pattern"
}

Definitions:
- analytical: asks detailed questions, wants specs/data, methodical
- expressive: enthusiastic, big-picture, relationship-oriented  
- driver: direct, results-focused, wants bottom line fast
- amiable: friendly, consensus-seeking, avoids conflict

Conversation:`;

function buildPersonalityContext(profile: any): string {
  if (!profile) return '';
  const tips: string[] = [];
  switch (profile.style) {
    case 'analytical': tips.push('This visitor is analytical — lead with data, ROI numbers, and specific capabilities. Be precise.'); break;
    case 'expressive': tips.push('This visitor is expressive — be enthusiastic, paint the big picture, and share success stories.'); break;
    case 'driver': tips.push('This visitor is a driver — be direct, get to the point fast, focus on results and bottom line.'); break;
    case 'amiable': tips.push('This visitor is amiable — be warm, build rapport, emphasize team benefits and ease of adoption.'); break;
  }
  if (profile.decision_pace === 'fast') tips.push('They make quick decisions — offer a clear next step now.');
  if (profile.decision_pace === 'deliberate') tips.push('They decide carefully — don\'t rush, offer resources to review.');
  switch (profile.proof_preference) {
    case 'data': tips.push('They prefer data — mention specific metrics and ROI.'); break;
    case 'testimonials': tips.push('They prefer social proof — mention what other companies have achieved.'); break;
    case 'case_studies': tips.push('They prefer case studies — offer to share detailed examples.'); break;
    case 'demos': tips.push('They prefer seeing things in action — suggest a live demo.'); break;
  }
  return '\n\nPERSONALITY INSIGHT (adapt your tone accordingly): ' + tips.join(' ');
}

async function analyzePersonality(messages: any[], apiKey: string) {
  const convo = messages.map((m: any) => `${m.role}: ${m.content}`).join('\n');
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: PERSONALITY_PROMPT + '\n\n' + convo }],
        max_tokens: 150,
        temperature: 0.3,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages, session_id } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages array required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 500 });
    }

    const sb = supabaseAdmin();

    // Create or update session
    let currentSessionId = session_id;
    if (!currentSessionId) {
      const { data: session } = await sb.from('chat_sessions').insert({ source: 'widget' }).select().single();
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

    // Check for existing personality profile
    let personalityProfile = null;
    if (currentSessionId) {
      const { data: sessionData } = await sb.from('chat_sessions').select('personality_profile').eq('id', currentSessionId).single();
      personalityProfile = sessionData?.personality_profile;
    }

    // Count user messages
    const userMessageCount = messages.filter((m: any) => m.role === 'user').length;

    // Analyze personality after 3 user messages if not already done
    if (!personalityProfile && userMessageCount >= 3) {
      personalityProfile = await analyzePersonality(messages, apiKey);
      if (personalityProfile && currentSessionId) {
        await sb.from('chat_sessions').update({
          personality_profile: personalityProfile,
          updated_at: new Date().toISOString(),
        }).eq('id', currentSessionId);
      }
    }

    // Build system prompt with personality context
    const systemPrompt = SYSTEM_PROMPT + buildPersonalityContext(personalityProfile);

    // Call OpenAI
    const openaiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: any) => ({ role: m.role, content: m.content })),
    ];

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: openaiMessages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('OpenAI error:', errBody);
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't process that. Can you try again?";

    // Save assistant message
    if (currentSessionId) {
      await sb.from('chat_messages').insert({
        session_id: currentSessionId,
        role: 'assistant',
        content: reply,
      });

      // Extract email if mentioned
      const emailMatch = reply.match(/[\w.-]+@[\w.-]+\.\w+/) || lastUserMsg?.content?.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch) {
        await sb.from('chat_sessions').update({
          visitor_email: emailMatch[0],
          updated_at: new Date().toISOString(),
        }).eq('id', currentSessionId);
      }

      // Extract name from user messages
      const nameMatch = lastUserMsg?.content?.match(/(?:my name is|i'm|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
      if (nameMatch) {
        await sb.from('chat_sessions').update({
          visitor_name: nameMatch[1],
          updated_at: new Date().toISOString(),
        }).eq('id', currentSessionId);
      }
    }

    return NextResponse.json({
      reply,
      session_id: currentSessionId,
      personality: personalityProfile || undefined,
    });
  } catch (err: any) {
    console.error('Chat error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

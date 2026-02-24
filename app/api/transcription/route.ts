export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// SYSTEM PROMPTS — Used for AI analysis of call transcripts
// ============================================================================

const ANALYSIS_SYSTEM_PROMPT = `You are a Sales Intelligence AI analyzing a sales call transcript.
You must extract structured data in JSON format. Be precise and factual — only report what is actually stated or strongly implied.

Analyze the transcript and return a JSON object with these fields:

{
  "summary": "2-3 sentence executive summary of the meeting",
  "actionItems": [
    { "task": "specific action to take", "assignee": "who should do it (sales rep or prospect name)", "deadline": "when mentioned or 'TBD'", "priority": "high|medium|low" }
  ],
  "mentorAnswers": {
    "wantedProposal": true/false/null,
    "gaveGoAhead": true/false/null,
    "modifications": "any changes or customizations requested",
    "concerns": "any objections, hesitations, or worries expressed",
    "nextSteps": "agreed-upon next actions",
    "sentiment": "positive|neutral|cautious"
  },
  "personalitySignals": {
    "type": "Driver|Analytical|Expressive|Amiable",
    "confidence": 0.0-1.0,
    "signals": ["specific behavioral observation 1", "observation 2", "observation 3"]
  },
  "newContacts": [
    { "name": "any new person mentioned", "company": "their company if stated", "role": "their title if stated" }
  ],
  "keyTopics": ["topic1", "topic2", "topic3"]
}

PERSONALITY CLASSIFICATION RULES:
- Driver: Direct, results-focused, mentions ROI/timeline/bottom-line, brief responses, controls conversation pace
- Analytical: Asks detailed questions, wants specs/data/compliance, methodical, cautious, mentions "need to review"
- Expressive: Enthusiastic, uses stories/vision language, says "imagine/love/exciting", animated, relationship-focused
- Amiable: Inclusive ("my team", "we"), consensus-building, says "need to check with...", patient, avoids conflict

Only include newContacts for people NOT already in the conversation (i.e., third parties mentioned).
Only flag sentiment as "cautious" if there are genuine concerns — not mere questions.`;

// ============================================================================
// In-memory transcript storage (production: Supabase)
// ============================================================================
const transcripts: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, transcript, projectId, contactId } = body;

    // ── Action: Analyze transcript ──────────────────────────
    if (action === 'analyze') {
      if (!transcript) {
        return NextResponse.json({ error: 'No transcript provided' }, { status: 400 });
      }

      // In dev mode: simulate AI analysis from transcript keywords
      // In production: send to OpenAI/Claude with ANALYSIS_SYSTEM_PROMPT
      const analysis = simulateAnalysis(transcript);

      return NextResponse.json({
        success: true,
        analysis,
        systemPrompt: ANALYSIS_SYSTEM_PROMPT,
        note: 'Dev mode: using keyword-based analysis. Production: connect OpenAI/Claude API.',
      });
    }

    // ── Action: Store finalized transcript ──────────────────
    if (action === 'store') {
      const record = {
        id: 'tx-' + Date.now(),
        projectId: projectId || null,
        contactId: contactId || null,
        transcript: transcript || '',
        analysis: body.analysis || null,
        audioUrl: body.audioUrl || null,
        duration: body.duration || 0,
        createdAt: new Date().toISOString(),
        status: 'finalized',
      };
      transcripts.push(record);
      return NextResponse.json({ success: true, transcriptId: record.id });
    }

    // ── Action: Transcribe audio (server-side) ──────────────
    if (action === 'transcribe') {
      // Production: Forward audio to Deepgram/Whisper
      return NextResponse.json({
        success: true,
        provider: 'web-speech-api',
        note: 'Using browser Web Speech API for dev. For production, integrate Deepgram (recommended for sales) or OpenAI Whisper.',
        integrationGuide: {
          deepgram: {
            url: 'wss://api.deepgram.com/v1/listen',
            features: 'Real-time streaming, speaker diarization, custom vocabulary for sales terms',
            pricing: 'Pay-per-minute, ~$0.0043/min for Nova-2',
            setup: 'npm install @deepgram/sdk && set DEEPGRAM_API_KEY',
          },
          whisper: {
            url: 'https://api.openai.com/v1/audio/transcriptions',
            features: 'Batch transcription, high accuracy, 57 languages',
            pricing: '$0.006/min',
            setup: 'Use existing OPENAI_API_KEY, send audio as multipart form data',
          },
          assemblyai: {
            url: 'wss://api.assemblyai.com/v2/realtime/ws',
            features: 'Real-time, sentiment analysis built-in, PII redaction',
            pricing: '$0.015/min real-time',
            setup: 'npm install assemblyai && set ASSEMBLYAI_API_KEY',
          },
        },
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ transcripts: transcripts.slice(-20), total: transcripts.length });
}

// ============================================================================
// DEV MODE — Keyword-based analysis simulation
// Production: Replace with OpenAI/Claude API call using ANALYSIS_SYSTEM_PROMPT
// ============================================================================
function simulateAnalysis(transcript: string): any {
  const lower = transcript.toLowerCase();
  const words = lower.split(/\s+/);

  // Detect proposal interest
  const wantedProposal = lower.includes('proposal') || lower.includes('quote') || lower.includes('pricing')
    || lower.includes('send me') || lower.includes('put together');

  // Detect go-ahead
  const gaveGoAhead = lower.includes('go ahead') || lower.includes('let\'s do it') || lower.includes('move forward')
    || lower.includes('approved') || lower.includes('green light') || lower.includes('sign');

  // Detect concerns
  const concerns: string[] = [];
  if (lower.includes('budget') || lower.includes('expensive') || lower.includes('cost')) concerns.push('Budget sensitivity');
  if (lower.includes('timeline') || lower.includes('deadline') || lower.includes('rush')) concerns.push('Timeline pressure');
  if (lower.includes('competitor') || lower.includes('alternative')) concerns.push('Evaluating alternatives');
  if (lower.includes('risk') || lower.includes('concern') || lower.includes('worried')) concerns.push('Risk aversion noted');

  // Detect modifications
  const mods: string[] = [];
  if (lower.includes('change') || lower.includes('modify') || lower.includes('adjust')) mods.push('Requested scope adjustments');
  if (lower.includes('custom') || lower.includes('specific')) mods.push('Wants customization');
  if (lower.includes('phase') || lower.includes('stages')) mods.push('Interested in phased approach');

  // Personality detection
  let personality = 'Analytical';
  let confidence = 0.6;
  const signals: string[] = [];
  const driverWords = ['bottom line', 'roi', 'results', 'quick', 'decide', 'now'];
  const analyticalWords = ['data', 'spec', 'detail', 'review', 'compliance', 'compare', 'numbers'];
  const expressiveWords = ['imagine', 'vision', 'exciting', 'love', 'amazing', 'story', 'potential'];
  const amiableWords = ['team', 'everyone', 'together', 'consensus', 'comfortable', 'feel'];

  const scores = {
    Driver: driverWords.filter(w => lower.includes(w)).length,
    Analytical: analyticalWords.filter(w => lower.includes(w)).length,
    Expressive: expressiveWords.filter(w => lower.includes(w)).length,
    Amiable: amiableWords.filter(w => lower.includes(w)).length,
  };

  const topType = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  if (topType[1] > 0) {
    personality = topType[0];
    confidence = Math.min(0.95, 0.5 + topType[1] * 0.1);
  }

  if (personality === 'Driver') signals.push('Used results-oriented language', 'Focused on outcomes and timelines', 'Direct communication style');
  if (personality === 'Analytical') signals.push('Asked for detailed specifications', 'Methodical questioning pattern', 'Requested documentation');
  if (personality === 'Expressive') signals.push('Used enthusiastic language', 'Focused on vision and possibilities', 'Engaged in storytelling');
  if (personality === 'Amiable') signals.push('Referenced team input', 'Consensus-seeking behavior', 'Prioritized relationship building');

  // Extract action items
  const actionItems: any[] = [];
  if (wantedProposal) actionItems.push({ task: 'Draft and send proposal', assignee: 'Sales Rep', deadline: 'End of week', priority: 'high' });
  if (lower.includes('follow up') || lower.includes('follow-up')) actionItems.push({ task: 'Schedule follow-up meeting', assignee: 'Sales Rep', deadline: 'Within 2 days', priority: 'high' });
  if (lower.includes('send') && (lower.includes('info') || lower.includes('document') || lower.includes('case study')))
    actionItems.push({ task: 'Send requested materials', assignee: 'Sales Rep', deadline: 'Tomorrow', priority: 'medium' });
  if (lower.includes('demo') || lower.includes('demonstration'))
    actionItems.push({ task: 'Schedule product demo', assignee: 'Sales Rep', deadline: 'This week', priority: 'high' });
  if (lower.includes('contract') || lower.includes('agreement'))
    actionItems.push({ task: 'Prepare contract documents', assignee: 'Sales Rep', deadline: 'TBD', priority: 'medium' });

  // Sentiment
  const posWords = ['great', 'excellent', 'perfect', 'love', 'excited', 'impressive', 'yes'];
  const negWords = ['concern', 'worried', 'expensive', 'problem', 'issue', 'difficult', 'no'];
  const posCount = posWords.filter(w => lower.includes(w)).length;
  const negCount = negWords.filter(w => lower.includes(w)).length;
  const sentiment = posCount > negCount + 1 ? 'positive' : negCount > posCount + 1 ? 'cautious' : 'neutral';

  // Key topics
  const topics: string[] = [];
  if (lower.includes('pricing') || lower.includes('cost') || lower.includes('budget')) topics.push('Pricing & Budget');
  if (lower.includes('timeline') || lower.includes('schedule') || lower.includes('deadline')) topics.push('Timeline');
  if (lower.includes('warehouse') || lower.includes('automation') || lower.includes('system')) topics.push('System Requirements');
  if (lower.includes('integration') || lower.includes('netsuite') || lower.includes('erp')) topics.push('Integration Needs');
  if (lower.includes('support') || lower.includes('training') || lower.includes('onboarding')) topics.push('Support & Training');
  if (lower.includes('competitor') || lower.includes('alternative')) topics.push('Competitive Landscape');
  if (topics.length === 0) topics.push('General Discussion', 'Relationship Building');

  // New contacts (simple name detection)
  const newContacts: any[] = [];
  const namePatterns = lower.match(/(?:talk to|speak with|meet|mention|contact|cc|include|loop in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi);
  if (namePatterns) {
    namePatterns.forEach(match => {
      const name = match.replace(/^(talk to|speak with|meet|mention|contact|cc|include|loop in)\s+/i, '').trim();
      if (name.length > 2 && name.includes(' ')) newContacts.push({ name, company: '', role: '' });
    });
  }

  return {
    summary: `Sales conversation covering ${topics.join(', ').toLowerCase()}. ${sentiment === 'positive' ? 'The prospect showed strong interest' : sentiment === 'cautious' ? 'Some concerns were raised' : 'Discussion was productive'}. ${wantedProposal ? 'A proposal was requested.' : ''} ${gaveGoAhead ? 'The prospect gave the go-ahead to move forward.' : ''} ${actionItems.length} action items identified.`,
    actionItems,
    mentorAnswers: {
      wantedProposal: wantedProposal || null,
      gaveGoAhead: gaveGoAhead || null,
      modifications: mods.join('. ') || '',
      concerns: concerns.join('. ') || '',
      nextSteps: actionItems.length > 0 ? actionItems[0].task : 'Continue engagement',
      sentiment,
    },
    personalitySignals: { type: personality, confidence, signals },
    newContacts,
    keyTopics: topics,
  };
}

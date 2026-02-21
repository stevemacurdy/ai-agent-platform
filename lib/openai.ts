// ============================================================================
// OPENAI INTEGRATION - AI Analysis for Agents
// ============================================================================

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function chatCompletion(
  messages: ChatMessage[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  const { model = 'gpt-4o-mini', temperature = 0.7, maxTokens = 1000 } = options;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
  }

  const data: ChatCompletionResponse = await response.json();
  return data.choices[0]?.message?.content || '';
}

// ============ CFO AGENT AI FUNCTIONS ============

export async function analyzeCashFlow(data: {
  ar: number;
  ap: number;
  overdueAR: number;
  overdueAP: number;
}): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are an AI CFO assistant. Analyze financial data and provide actionable insights.
Keep responses concise and focused on the most important 2-3 recommendations.
Format with bullet points for clarity.`
    },
    {
      role: 'user',
      content: `Analyze this financial snapshot:
- Accounts Receivable: $${data.ar.toLocaleString()}
- Accounts Payable: $${data.ap.toLocaleString()}
- Overdue AR: $${data.overdueAR.toLocaleString()}
- Overdue AP: $${data.overdueAP.toLocaleString()}
- Net Position: $${(data.ar - data.ap).toLocaleString()}

What are the top priorities and recommendations?`
    }
  ];

  return chatCompletion(messages, { temperature: 0.5 });
}

export async function generateCollectionStrategy(invoices: any[]): Promise<string> {
  const overdueInvoices = invoices.filter((inv: any) => {
    const dueDate = new Date(inv.invoice_date_due);
    return dueDate < new Date();
  });

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are an AI CFO assistant specializing in accounts receivable collection.
Provide specific, actionable collection strategies prioritized by amount and age.`
    },
    {
      role: 'user',
      content: `We have ${overdueInvoices.length} overdue invoices totaling $${overdueInvoices.reduce((sum: number, inv: any) => sum + (inv.amount_residual || 0), 0).toLocaleString()}.

Top overdue accounts:
${overdueInvoices.slice(0, 5).map((inv: any) => 
  `- ${inv.partner_id?.[1] || 'Unknown'}: $${inv.amount_residual?.toLocaleString()} (Due: ${inv.invoice_date_due})`
).join('\n')}

What's the recommended collection strategy?`
    }
  ];

  return chatCompletion(messages, { temperature: 0.5 });
}

// ============ SALES AGENT AI FUNCTIONS ============

export async function analyzePipeline(data: {
  totalDeals: number;
  pipelineValue: number;
  wonValue: number;
  dealsByStage: Record<string, { count: number; value: number }>;
}): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are an AI sales coach. Analyze pipeline data and provide actionable insights.
Focus on conversion opportunities and deals that need attention.`
    },
    {
      role: 'user',
      content: `Analyze this sales pipeline:
- Total Deals: ${data.totalDeals}
- Pipeline Value: $${data.pipelineValue.toLocaleString()}
- Won Revenue: $${data.wonValue.toLocaleString()}

Deals by Stage:
${Object.entries(data.dealsByStage).map(([stage, info]) => 
  `- ${stage}: ${info.count} deals ($${info.value.toLocaleString()})`
).join('\n')}

What opportunities should we focus on?`
    }
  ];

  return chatCompletion(messages, { temperature: 0.6 });
}

export async function generateCallPrep(contact: any, company: any, deals: any[]): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are an AI sales assistant. Generate a concise call prep brief.
Include key talking points, potential objections, and recommended next steps.`
    },
    {
      role: 'user',
      content: `Prepare a call brief for:

Contact: ${contact.firstname || ''} ${contact.lastname || ''}
Company: ${company?.name || contact.company || 'Unknown'}
Industry: ${company?.industry || 'Unknown'}
Lifecycle Stage: ${contact.lifecyclestage || 'Unknown'}

Open Deals:
${deals.slice(0, 3).map((deal: any) => 
  `- ${deal.properties?.dealname}: $${deal.properties?.amount || 0} (Stage: ${deal.properties?.dealstage})`
).join('\n') || 'No open deals'}

Generate a call prep brief with talking points and strategy.`
    }
  ];

  return chatCompletion(messages, { temperature: 0.7 });
}

export async function scoreLeads(contacts: any[]): Promise<Array<{ id: string; score: number; reason: string }>> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are an AI lead scoring system. Score leads 1-100 based on engagement signals.
Return JSON array: [{"id": "string", "score": number, "reason": "string"}]`
    },
    {
      role: 'user',
      content: `Score these leads:
${contacts.slice(0, 10).map((c: any) => 
  `ID: ${c.id} | ${c.properties?.firstname} ${c.properties?.lastname} | ${c.properties?.company || 'No company'} | Stage: ${c.properties?.lifecyclestage || 'unknown'}`
).join('\n')}

Return JSON scores only, no explanation text.`
    }
  ];

  const response = await chatCompletion(messages, { temperature: 0.3 });
  
  try {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch {
    return [];
  }
}

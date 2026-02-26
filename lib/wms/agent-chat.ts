// @ts-nocheck
// ============================================================================
// Shared AI chat handler for warehouse-connected agents
// ============================================================================
import OpenAI from 'openai';
import { WMS_TOOLS, executeTool } from '@/lib/wms/wms-tools';
import { PALLET_TOOLS, executePalletTool } from '@/lib/wms/pallet-tools';

const ALL_TOOLS = [...WMS_TOOLS, ...PALLET_TOOLS];

async function executeAnyTool(name, args, companyId) {
  // Try WMS tools first
  const wmsTool = WMS_TOOLS.find(t => t.function.name === name);
  if (wmsTool) return executeTool(name, args, companyId);

  // Try pallet tools
  const palletTool = PALLET_TOOLS.find(t => t.function.name === name);
  if (palletTool) return executePalletTool(name, args, companyId);

  return { error: `Unknown tool: ${name}` };
}

export async function runAgentChat(systemPrompt, message, history, companyId) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const messages = [{ role: 'system', content: systemPrompt }];

  if (history && Array.isArray(history)) {
    for (const msg of history.slice(-10)) {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  messages.push({ role: 'user', content: message });

  try {
    let response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      tools: ALL_TOOLS,
      tool_choice: 'auto',
      max_tokens: 1500,
      temperature: 0.3,
    });

    let assistantMessage = response.choices[0].message;

    let rounds = 0;
    while (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0 && rounds < 3) {
      rounds++;
      messages.push(assistantMessage);

      const toolResults = await Promise.all(
        assistantMessage.tool_calls.map(async (tc) => {
          const args = JSON.parse(tc.function.arguments);
          const result = await executeAnyTool(tc.function.name, args, companyId);
          return { role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result) };
        })
      );

      messages.push(...toolResults);

      response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        tools: ALL_TOOLS,
        tool_choice: 'auto',
        max_tokens: 1500,
        temperature: 0.3,
      });

      assistantMessage = response.choices[0].message;
    }

    return { success: true, response: assistantMessage.content || 'No response generated.' };
  } catch (err) {
    console.error('Agent chat error:', err);
    return { success: false, error: err.message || 'AI request failed' };
  }
}

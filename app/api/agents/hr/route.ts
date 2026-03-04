export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withTierEnforcement } from '@/lib/usage-enforcement';
import { trackUsage } from '@/lib/usage-tracker';
import { getHRData } from '@/lib/hr/hr-data';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function _GET(request: NextRequest) {
  trackUsage(request, 'hr');
  try {
    const { data, error } = await supabase.from('agent_hr_data').select('*').limit(100);
    if (error || !data?.length) {
      const demoData = getHRData('_default');
      return NextResponse.json({ ...demoData, source: 'demo' });
    }
    return NextResponse.json({ items: data, source: 'live' });
  } catch {
    const demoData = getHRData('_default');
    return NextResponse.json({ ...demoData, source: 'demo' });
  }
}
export const GET = withTierEnforcement(_GET);

export async function POST(request: NextRequest) {
  trackUsage(request, 'hr', 'action');
  const body = await request.json();
  const { action } = body;
  switch (action) {
    case 'create-position': {
      const { positionTitle, department, hiringManager, salaryRange } = body;
      const { data, error } = await supabase.from('agent_hr_data').insert({
        position_title: positionTitle, department, hiring_manager: hiringManager,
        salary_range: salaryRange, status: 'draft',
      }).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ result: 'Position created', data });
    }
    case 'update-status': {
      const { id, status, notes } = body;
      const updates: Record<string, unknown> = {};
      if (status) updates.status = status;
      if (notes) updates.notes = notes;
      const { error } = await supabase.from('agent_hr_data').update(updates).eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ result: 'Status updated' });
    }
    case 'generate-jd': {
      const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
      const { positionTitle, department, requirements, salaryRange } = body;
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an HR AI writing job descriptions for a warehouse systems integration company (30+ employees, 6 countries). Tone: professional but approachable.' },
          { role: 'user', content: `Write a complete job description for "${positionTitle}" in ${department}. Salary: ${salaryRange || 'Competitive'}. Requirements: ${requirements || 'standard'}. Include: 1) Compelling summary (3 sentences), 2) Key responsibilities (6-8 bullets), 3) Required qualifications, 4) Preferred qualifications, 5) What we offer, 6) Salary context.` }
        ],
        max_tokens: 1000, temperature: 0.3,
      });
      return NextResponse.json({ result: response.choices[0]?.message?.content || 'Unable to generate JD.' });
    }
    case 'retention-analysis': {
      const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
      const workforce = JSON.stringify(body.workforce || []);
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an HR analytics AI for a warehouse systems integration company.' },
          { role: 'user', content: `Workforce data: ${workforce}\n\nIdentify: 1) Departments at highest flight risk (tenure patterns, satisfaction, market demand), 2) Root causes per risk area, 3) Specific retention actions (compensation, career path, management), 4) Cost of turnover per role, 5) 90-day retention action plan.` }
        ],
        max_tokens: 1000, temperature: 0.3,
      });
      return NextResponse.json({ result: response.choices[0]?.message?.content || 'Unable to analyze retention.' });
    }
    case 'salary-benchmark': {
      const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
      const { positionTitle, location, experience } = body;
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a compensation analyst AI.' },
          { role: 'user', content: `Generate a competitive salary benchmark for "${positionTitle}" in ${location || 'Utah'}. Experience: ${experience || 'mid-level'}. Include: 1) Market range (25th/50th/75th/90th percentiles), 2) Total comp with benefits, 3) How we compare, 4) Recommendations for competitiveness, 5) Key factors driving compensation.` }
        ],
        max_tokens: 1000, temperature: 0.3,
      });
      return NextResponse.json({ result: response.choices[0]?.message?.content || 'Unable to benchmark salary.' });
    }
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}

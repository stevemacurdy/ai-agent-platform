// @ts-nocheck
'use client';
import WarehouseAgentUI from '@/components/agents/warehouse-agent-ui';

export default function OrganizationLead() {
  return (
    <WarehouseAgentUI
      title="Organization Lead"
      icon="🎯"
      subtitle="Executive overview · Cross-functional metrics · Strategic insights"
      apiPath="/api/agents/org-lead"
      gradientFrom="from-violet-600"
      gradientTo="to-purple-500"
      quickPrompts={[
        'Give me an executive summary of warehouse operations',
        'What\'s our overall health score?',
        'Any risks I should know about?',
        'How many active customers and orders do we have?',
        'Show me the full order and inventory picture',
        'What areas need attention right now?',
      ]}
    />
  );
}

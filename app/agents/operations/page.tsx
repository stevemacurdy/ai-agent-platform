// @ts-nocheck
'use client';
import WarehouseAgentUI from '@/components/agents/warehouse-agent-ui';

export default function OperationsAgent() {
  return (
    <WarehouseAgentUI
      title="Operations Employee"
      icon="⚙️"
      subtitle="Order fulfillment · Shipping · Daily logistics"
      apiPath="/api/agents/operations"
      gradientFrom="from-orange-600"
      gradientTo="to-red-500"
      quickPrompts={[
        'What orders are in the pipeline right now?',
        'Show me anything stuck in picking or packing',
        'What shipped today?',
        'Are any orders at risk of missing their ship date?',
        'Give me a fulfillment status breakdown',
        'What are the most recent orders?',
      ]}
    />
  );
}

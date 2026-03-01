// @ts-nocheck
'use client';
import WarehouseAgentUI from '@/components/agents/warehouse-agent-ui';

export default function SupplyChainAgent() {
  return (
    <WarehouseAgentUI
      title="Supply Chain Employee"
      icon="🔗"
      subtitle="Inventory health · Replenishment · Vendor management"
      apiPath="/api/agents/supply-chain"
      gradientFrom="from-teal-600"
      gradientTo="to-cyan-500"
      quickPrompts={[
        'What items are running low on stock?',
        'Are there any out-of-stock SKUs?',
        'Show me inventory levels by temperature zone',
        'What purchase orders are open?',
        'Give me a full inventory summary',
        'Which customers have the most inventory stored?',
      ]}
    />
  );
}

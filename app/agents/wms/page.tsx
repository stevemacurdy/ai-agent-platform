// @ts-nocheck
'use client';
import WarehouseAgentUI from '@/components/agents/warehouse-agent-ui';

export default function WMSAgentPage() {
  return (
    <WarehouseAgentUI
      title="WMS Agent"
      icon="🏭"
      subtitle="Live warehouse data · AI-powered queries"
      apiPath="/api/agents/wms"
      gradientFrom="from-blue-600"
      gradientTo="to-cyan-500"
      quickPrompts={[
        'What are our current inventory levels?',
        'Show me any low-stock items',
        'What orders are in progress?',
        'Any items out of stock?',
        'Show recent orders',
        'Give me an order status breakdown',
      ]}
    />
  );
}

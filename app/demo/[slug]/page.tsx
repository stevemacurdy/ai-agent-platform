import { notFound } from 'next/navigation';
import '@/lib/demo-agents';
import { getAgent, getEnabledAgents } from '@/lib/demo-registry';
import DemoShell from '@/components/demo/DemoShell';

interface PageProps {
  params: { slug: string };
}

export default function DemoPage({ params }: PageProps) {
  const agent = getAgent(params.slug);
  if (!agent) return notFound();

  const allSlugs = getEnabledAgents().map(a => ({
    slug: a.meta.slug,
    name: a.meta.name,
    icon: a.meta.icon,
  }));

  return <DemoShell data={agent} allSlugs={allSlugs} />;
}

export function generateMetadata({ params }: PageProps) {
  const agent = getAgent(params.slug);
  if (!agent) return { title: 'Not Found | WoulfAI' };
  return {
    title: agent.meta.name + ' AI Employee Demo | WoulfAI',
    description: agent.meta.valueProposition,
  };
}

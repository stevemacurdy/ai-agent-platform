'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AGENTS } from '@/lib/agents/agent-registry';

export default function OnboardingWizard() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.agentId as string;
  const agent = Object.values(AGENTS).find(a => a.slug === agentId);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  if (!agent) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="text-4xl mb-3">{'\u2753'}</div>
        <h1 className="text-xl font-bold mb-2">Agent Not Found</h1>
        <p className="text-sm text-gray-400 mb-4">No agent with slug "{agentId}".</p>
        <button onClick={() => router.push('/onboarding')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Back to Onboarding</button>
      </div>
    );
  }

  const steps = [
    { title: 'Welcome', content: 'Welcome to ' + agent.name + ' setup. This wizard will help you configure ' + agent.name + ' for your business in under 10 minutes.' },
    { title: 'Connect Data', content: 'Connect your data source. ' + agent.name + ' works best with live data from your existing tools.' },
    { title: 'Configure', content: 'Set your preferences for how ' + agent.name + ' should analyze and present information.' },
    { title: 'Review', content: 'Review your setup and activate ' + agent.name + '.' },
  ];

  if (done) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="text-5xl mb-4">{'\u2705'}</div>
        <h1 className="text-2xl font-bold mb-2">{agent.name} is Ready!</h1>
        <p className="text-sm text-gray-400 mb-6">Your agent is configured and ready to use.</p>
        <div className="flex justify-center gap-3">
          <button onClick={() => router.push(agent.liveRoute)} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500">Open {agent.name}</button>
          <button onClick={() => router.push('/onboarding')} className="px-6 py-2.5 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10">Set Up Another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{agent.icon}</span>
        <div>
          <h1 className="text-xl font-bold">{agent.name} Setup</h1>
          <p className="text-xs text-gray-500">Step {step + 1} of {steps.length}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1">
        {steps.map((_, i) => (
          <div key={i} className={'flex-1 h-1 rounded-full ' + (i <= step ? 'bg-blue-500' : 'bg-white/10')} />
        ))}
      </div>

      <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-3">{steps[step].title}</h2>
        <p className="text-sm text-gray-400 leading-relaxed">{steps[step].content}</p>
      </div>

      <div className="flex justify-between">
        <button onClick={() => step > 0 ? setStep(step - 1) : router.push('/onboarding')}
          className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10">
          {step === 0 ? 'Back to Agents' : 'Previous'}
        </button>
        <button onClick={() => step < steps.length - 1 ? setStep(step + 1) : setDone(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500">
          {step === steps.length - 1 ? 'Activate Agent' : 'Next'}
        </button>
      </div>
    </div>
  );
}

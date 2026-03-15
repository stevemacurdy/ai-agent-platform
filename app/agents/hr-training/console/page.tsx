'use client';
import LMSDashboard from '@/components/lms/LMSDashboard';
import { useTrackConsoleView } from '@/lib/hooks/useUsageTracking';

export default function HRTrainingConsole() {
  useTrackConsoleView('hr-training');

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <LMSDashboard
        department="hr"
        title="HR Training & Compliance"
      />
    </div>
  );
}

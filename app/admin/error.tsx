'use client';

export default function AgentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-xl mx-auto p-6 mt-20 text-center">
      <div className="text-4xl mb-4">⚠️</div>
      <h2 className="text-xl font-bold text-[#1B2A4A] mb-2">Something went wrong</h2>
      <p className="text-sm text-[#6B7280] mb-6">
        {error.message || 'An unexpected error occurred while loading this page.'}
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-[#1B2A4A] text-white rounded-xl text-sm font-semibold hover:bg-[#233756] transition"
        >
          Try Again
        </button>
        <a
          href="/dashboard"
          className="px-5 py-2.5 border border-[#E5E7EB] text-[#6B7280] rounded-xl text-sm font-medium hover:bg-gray-50 transition"
        >
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}

export default function AgentsLoading() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-xl" />
        <div>
          <div className="h-6 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-32 bg-gray-100 rounded mt-2" />
        </div>
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-4">
            <div className="h-3 w-20 bg-gray-100 rounded mb-2" />
            <div className="h-7 w-24 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Tab bar skeleton */}
      <div className="flex gap-2 border-b border-[#E5E7EB] pb-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-9 w-24 bg-gray-100 rounded-lg" />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-4">
        <div className="h-4 w-3/4 bg-gray-100 rounded" />
        <div className="h-4 w-1/2 bg-gray-100 rounded" />
        <div className="h-4 w-2/3 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

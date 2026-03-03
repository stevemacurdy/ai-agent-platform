export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <div className="max-w-[1200px] mx-auto p-6 space-y-6 animate-pulse">
        {/* Header */}
        <div>
          <div className="h-7 w-64 bg-gray-200 rounded" />
          <div className="h-4 w-48 bg-gray-100 rounded mt-2" />
        </div>

        {/* Top row cards */}
        <div className="grid md:grid-cols-2 gap-5">
          {[1, 2].map(i => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 h-52">
              <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map(j => (
                  <div key={j}><div className="h-3 w-16 bg-gray-100 rounded mb-1" /><div className="h-6 w-20 bg-gray-200 rounded" /></div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom row cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 h-40">
              <div className="h-4 w-28 bg-gray-200 rounded mb-4" />
              <div className="space-y-3">
                {[1, 2].map(j => (
                  <div key={j} className="flex justify-between"><div className="h-3 w-24 bg-gray-100 rounded" /><div className="h-3 w-16 bg-gray-200 rounded" /></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

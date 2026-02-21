'use client'

import BugBashChecklist from '@/components/BugBashChecklist'
import Link from 'next/link'

export default function BugBashPage() {
  return (
    <div className="min-h-screen bg-[#06080D] text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-white flex items-center gap-1 transition-colors">
            \u2190 Back to Dashboard
          </Link>
        </div>
        <BugBashChecklist />
      </div>
    </div>
  )
}

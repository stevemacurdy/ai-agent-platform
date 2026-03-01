'use client'

import BugBashChecklist from '@/components/BugBashChecklist'
import Link from 'next/link'

export default function BugBashPage() {
  return (
    <div className="min-h-screen bg-[#F4F5F7] text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard" className="text-sm text-[#9CA3AF] hover:text-[#1B2A4A] flex items-center gap-1 transition-colors">
            \u2190 Back to Dashboard
          </Link>
        </div>
        <BugBashChecklist />
      </div>
    </div>
  )
}

'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

export default function UserDashboard() {
  const { profile, loading, isAdmin } = useAuth()
  useEffect(() => {
  }, [loading, profile])

  if (loading || !profile) return (
    <div className="min-h-screen bg-[#06080D] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  // isAdmin comes from useAuth above

  return (
    <div className="min-h-screen bg-[#06080D] text-white">
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {profile?.display_name || profile?.email?.split('@')[0]}</h1>
            <p className="text-sm text-gray-500 mt-1">{profile?.email} · {profile?.role}</p>
          </div>
          {isAdmin && (
            <Link href="/admin" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500">
              Admin Console →
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {isAdmin && (
            <Link href="/admin" className="bg-[#0A0E15] border border-white/5 rounded-xl p-5 hover:border-blue-500/20 transition-all group">
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-sm font-semibold group-hover:text-blue-400">Command Center</div>
              <div className="text-[10px] text-gray-600 mt-1">Admin dashboard</div>
            </Link>
          )}
          <Link href="/demo" className="bg-[#0A0E15] border border-white/5 rounded-xl p-5 hover:border-blue-500/20 transition-all group">
            <div className="text-2xl mb-2">🤖</div>
            <div className="text-sm font-semibold group-hover:text-blue-400">Agent Demos</div>
            <div className="text-[10px] text-gray-600 mt-1">Explore with sample data</div>
          </Link>
          <Link href="/pricing" className="bg-[#0A0E15] border border-white/5 rounded-xl p-5 hover:border-blue-500/20 transition-all group">
            <div className="text-2xl mb-2">💲</div>
            <div className="text-sm font-semibold group-hover:text-blue-400">Plans & Pricing</div>
            <div className="text-[10px] text-gray-600 mt-1">Upgrade your plan</div>
          </Link>
        </div>
      </div>
    </div>
  )
}

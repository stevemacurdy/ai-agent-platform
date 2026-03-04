'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AgentsPage() {
  const router = useRouter()
  useEffect(() => { router.replace('/dashboard') }, [router])
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-[#2A9D8F] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

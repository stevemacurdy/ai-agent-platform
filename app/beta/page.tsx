'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function BetaPage() {
  const router = useRouter()
  useEffect(() => {
    // Redirect to landing page with section anchor
    router.replace('/#beta')
  }, [router])
  return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#2A9D8F] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HowItWorksPage() {
  const router = useRouter()
  useEffect(() => {
    // Redirect to landing page with section anchor
    router.replace('/#how-it-works')
  }, [router])
  return (
    <div className="min-h-screen bg-[#06080D] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

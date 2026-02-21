'use client'
import { useEffect } from 'react'
export default function HomePage() {
  useEffect(() => { window.location.href = '/woulfai-landing.html' }, [])
  return <div style={{minHeight:'100vh',background:'#06080D'}}/>
}

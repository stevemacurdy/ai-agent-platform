'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthProvider'

interface OrgBranding {
  logo_url: string
  favicon_url: string
  primary_color: string
  secondary_color: string
  accent_color: string
  bg_color: string
  card_color: string
  font_family: string
  company_url: string
  support_email: string
  custom_css: string
  org_name: string
  org_slug: string
}

const DEFAULT_BRANDING: OrgBranding = {
  logo_url: '',
  favicon_url: '',
  primary_color: '#3B82F6',
  secondary_color: '#8B5CF6',
  accent_color: '#10B981',
  bg_color: '#06080D',
  card_color: '#0A0E15',
  font_family: 'Outfit',
  company_url: '',
  support_email: '',
  custom_css: '',
  org_name: 'WoulfAI',
  org_slug: 'woulfai',
}

const BrandingContext = createContext<{
  branding: OrgBranding
  loading: boolean
  updateBranding: (updates: Partial<OrgBranding>) => Promise<void>
}>({ branding: DEFAULT_BRANDING, loading: false, updateBranding: async () => {} })

export function BrandingProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth()
  const [branding, setBranding] = useState<OrgBranding>(DEFAULT_BRANDING)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!profile?.org_id) {
      setBranding(DEFAULT_BRANDING)
      injectCSS(DEFAULT_BRANDING)
      return
    }

    setLoading(true)
    fetch('/api/branding?orgId=' + profile.org_id, {
      headers: { 'x-admin-email': profile.email },
    })
      .then(r => r.json())
      .then(data => {
        if (data.branding) {
          const merged = { ...DEFAULT_BRANDING, ...data.branding }
          setBranding(merged)
          injectCSS(merged)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [profile?.org_id])

  const updateBranding = async (updates: Partial<OrgBranding>) => {
    if (!profile?.org_id) return
    const merged = { ...branding, ...updates }
    setBranding(merged)
    injectCSS(merged)

    await fetch('/api/branding', {
      method: 'POST',
      headers: { 'x-admin-email': profile.email, 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId: profile.org_id, updates }),
    })
  }

  return (
    <BrandingContext.Provider value={{ branding, loading, updateBranding }}>
      {children}
    </BrandingContext.Provider>
  )
}

function injectCSS(b: OrgBranding) {
  const root = document.documentElement
  root.style.setProperty('--brand-primary', b.primary_color)
  root.style.setProperty('--brand-secondary', b.secondary_color)
  root.style.setProperty('--brand-accent', b.accent_color)
  root.style.setProperty('--brand-bg', b.bg_color)
  root.style.setProperty('--brand-card', b.card_color)
  root.style.setProperty('--brand-font', b.font_family)

  // Inject custom CSS if present
  let customStyle = document.getElementById('org-custom-css')
  if (b.custom_css) {
    if (!customStyle) {
      customStyle = document.createElement('style')
      customStyle.id = 'org-custom-css'
      document.head.appendChild(customStyle)
    }
    customStyle.textContent = b.custom_css
  } else if (customStyle) {
    customStyle.remove()
  }

  // Update favicon
  if (b.favicon_url) {
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = b.favicon_url
  }
}

export const useBranding = () => useContext(BrandingContext)

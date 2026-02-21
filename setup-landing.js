const fs = require('fs');
const path = require('path');

// 1. Copy the unified HTML to public/
const src = 'C:/Users/steve/Desktop/WoulfAI-Unified (7).html';
if (!fs.existsSync(src)) { console.error('Source not found:', src); process.exit(1); }
fs.mkdirSync('public', { recursive: true });
let html = fs.readFileSync(src, 'utf8');
// Replace signin/signup modals with /login redirects
html = html.replaceAll("onclick=\"openModal('signin')\"", "onclick=\"window.location.href='/login'\"");
html = html.replaceAll("onclick=\"openModal('signup')\"", "onclick=\"window.location.href='/login'\"");
html = html.replaceAll("onclick=\"openModal('signin');toggleMobile()\"", "onclick=\"window.location.href='/login'\"");
html = html.replaceAll("onclick=\"openModal('signup');toggleMobile()\"", "onclick=\"window.location.href='/login'\"");
html = html.replaceAll("`openModal('signup')`", "`window.location.href='/login'`");
html = html.replaceAll("closeModal();openModal('signup')", "window.location.href='/login'");
html = html.replaceAll("closeModal();openModal('signin')", "window.location.href='/login'");
html = html.replace("function handleSignin(){closeModal();enterDash('client');}", "function handleSignin(){window.location.href='/login';}");
fs.writeFileSync('public/woulfai-landing.html', html);
const signinLeft = (html.match(/openModal\('signin'\)/g) || []).length;
const signupLeft = (html.match(/openModal\('signup'\)/g) || []).length;
console.log(`\u2713 Landing HTML copied to public/woulfai-landing.html`);
console.log(`  Remaining signin modals: ${signinLeft}, signup modals: ${signupLeft}`);

// 2. Write app/page.tsx
const page = `'use client'

import { useEffect, useRef, useState } from 'react'

export default function HomePage() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    let cancelled = false
    async function loadLanding() {
      try {
        const res = await fetch('/woulfai-landing.html')
        if (!res.ok || cancelled) return
        const html = await res.text()
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')
        const styles: HTMLStyleElement[] = []
        doc.querySelectorAll('style').forEach((s) => {
          const style = document.createElement('style')
          style.setAttribute('data-landing', 'true')
          style.textContent = s.textContent
          document.head.appendChild(style)
          styles.push(style)
        })
        const links: HTMLLinkElement[] = []
        doc.querySelectorAll('link[href*="fonts.googleapis"]').forEach((l) => {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = (l as HTMLLinkElement).href
          link.setAttribute('data-landing', 'true')
          document.head.appendChild(link)
          links.push(link)
        })
        if (rootRef.current && !cancelled) {
          rootRef.current.innerHTML = doc.body.innerHTML
        }
        const scripts: HTMLScriptElement[] = []
        doc.querySelectorAll('script').forEach((s) => {
          const script = document.createElement('script')
          script.setAttribute('data-landing', 'true')
          script.textContent = s.textContent
          document.body.appendChild(script)
          scripts.push(script)
        })
        cleanupRef.current = () => {
          styles.forEach((s) => s.remove())
          links.forEach((l) => l.remove())
          scripts.forEach((s) => s.remove())
        }
        setLoading(false)
        } catch (err) {
        console.error('Failed to load landing page:', err)
        setLoading(false)
      }
    }
    loadLanding()
    return () => {
      cancelled = true
      if (cleanupRef.current) cleanupRef.current()
    }
  }, [])

  return (
    <>
      <style>{\`body { background: #06080D !important; }\`}</style>
      {loading && (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#06080D' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #3B82F6', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      )}
      <div ref={rootRef} style={{ minHeight: loading ? 0 : '100vh' }} />
    </>
  )
}
`;
fs.writeFileSync('app/page.tsx', page);
console.log(`✓ app/page.tsx written (${page.split('\n').length} lines)`);
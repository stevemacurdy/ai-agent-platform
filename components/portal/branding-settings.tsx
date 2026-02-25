// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';

interface Branding {
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  sidebar_style: 'dark' | 'light' | 'branded';
  welcome_message: string | null;
}

const DEFAULT_BRANDING: Branding = {
  logo_url: null,
  primary_color: '#3182CE',
  secondary_color: '#06080D',
  sidebar_style: 'dark',
  welcome_message: null,
};

export default function BrandingSettings({ companyId, isAdmin }: { companyId: string; isAdmin: boolean }) {
  const [branding, setBranding] = useState<Branding>(DEFAULT_BRANDING);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    fetch(`/api/portal/branding?company_id=${companyId}`)
      .then(r => r.json())
      .then(d => { if (d.branding) setBranding(d.branding); })
      .catch(() => {});
  }, [companyId]);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/portal/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId, ...branding }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {}
    setSaving(false);
  };

  if (!isAdmin) return null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">
        Company Branding
      </h3>

      <div className="space-y-4">
        {/* Logo URL */}
        <div>
          <label className="block text-xs text-white/50 mb-1">Logo URL</label>
          <input
            type="url"
            placeholder="https://example.com/logo.png"
            value={branding.logo_url || ''}
            onChange={(e) => setBranding(p => ({ ...p, logo_url: e.target.value || null }))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
          />
          {branding.logo_url && (
            <div className="mt-2 p-2 bg-white/5 rounded-lg inline-block">
              <img src={branding.logo_url} alt="Logo preview" className="h-8 max-w-[120px] object-contain" />
            </div>
          )}
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-white/50 mb-1">Primary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={branding.primary_color}
                onChange={(e) => setBranding(p => ({ ...p, primary_color: e.target.value }))}
                className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
              />
              <input
                type="text"
                value={branding.primary_color}
                onChange={(e) => setBranding(p => ({ ...p, primary_color: e.target.value }))}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Secondary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={branding.secondary_color}
                onChange={(e) => setBranding(p => ({ ...p, secondary_color: e.target.value }))}
                className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
              />
              <input
                type="text"
                value={branding.secondary_color}
                onChange={(e) => setBranding(p => ({ ...p, secondary_color: e.target.value }))}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Style */}
        <div>
          <label className="block text-xs text-white/50 mb-1">Sidebar Style</label>
          <div className="flex gap-2">
            {(['dark', 'light', 'branded'] as const).map(style => (
              <button
                key={style}
                onClick={() => setBranding(p => ({ ...p, sidebar_style: style }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  branding.sidebar_style === style
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Welcome Message */}
        <div>
          <label className="block text-xs text-white/50 mb-1">Welcome Message</label>
          <textarea
            placeholder="Welcome to your workspace!"
            value={branding.welcome_message || ''}
            onChange={(e) => setBranding(p => ({ ...p, welcome_message: e.target.value || null }))}
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {/* Save */}
        <button
          onClick={save}
          disabled={saving}
          className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm text-white font-medium transition-colors"
        >
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Branding'}
        </button>
      </div>
    </div>
  );
}

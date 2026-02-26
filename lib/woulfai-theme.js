// WoulfAI Design System — Tailwind Config Extension
// Merge this into your existing tailwind.config.ts
//
// Usage: Add these to the `extend` section of your theme.
// Then use classes like: bg-w-navy, text-w-teal, border-w-border, shadow-w-md, rounded-w-md, etc.

const woulfaiTheme = {
  colors: {
    'w-navy':        '#1B2A4A',
    'w-navy-light':  '#233756',
    'w-navy-dark':   '#132038',
    'w-navy-info':   '#3B5278',

    'w-teal':        '#2A9D8F',
    'w-teal-light':  '#3BB5A6',

    'w-orange':      '#F5920B',

    'w-bg':          '#F4F5F7',
    'w-surface':     '#FFFFFF',
    'w-surface-alt': '#FAFBFC',
    'w-surface-row': '#F9FAFB',

    'w-text':        '#1A1A2E',
    'w-text-muted':  '#6B7280',
    'w-text-faint':  '#9CA3AF',

    'w-border':      '#E5E7EB',

    'w-success':     '#2A9D8F',
    'w-warning':     '#F5920B',
    'w-error':       '#DC4F4F',
    'w-inactive':    '#9CA3AF',
  },
  borderRadius: {
    'w-sm':   '8px',
    'w-md':   '12px',
    'w-lg':   '16px',
    'w-xl':   '20px',
  },
  boxShadow: {
    'w-sm':  '0 1px 3px rgba(27,42,74,0.06), 0 1px 2px rgba(27,42,74,0.04)',
    'w-md':  '0 4px 12px rgba(27,42,74,0.08)',
    'w-lg':  '0 8px 30px rgba(27,42,74,0.12)',
    'w-xl':  '0 12px 40px rgba(27,42,74,0.16)',
  },
  fontFamily: {
    'w-heading': ['Outfit', 'DM Sans', '-apple-system', 'sans-serif'],
    'w-body':    ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
  },
  spacing: {
    'w-1':  '8px',
    'w-2':  '16px',
    'w-3':  '24px',
    'w-4':  '32px',
    'w-5':  '40px',
    'w-6':  '48px',
    'w-8':  '64px',
    'w-10': '80px',
    'w-12': '96px',
  },
};

module.exports = woulfaiTheme;

/* ─────────────────────────────────────────────────────────
   HOW TO INTEGRATE INTO tailwind.config.ts:
   ─────────────────────────────────────────────────────────

   // tailwind.config.ts
   import type { Config } from "tailwindcss";
   const woulfai = require("./lib/woulfai-theme");

   const config: Config = {
     content: ["./app/**\/*.{ts,tsx}", "./components/**\/*.{ts,tsx}"],
     theme: {
       extend: {
         colors: woulfai.colors,
         borderRadius: woulfai.borderRadius,
         boxShadow: woulfai.boxShadow,
         fontFamily: woulfai.fontFamily,
         spacing: woulfai.spacing,
       },
     },
     plugins: [],
   };
   export default config;

   THEN USE IN COMPONENTS:
   ─────────────────────────────────────────────────────────
   <div className="bg-w-bg">                        // light gray background
     <div className="bg-w-surface rounded-w-md shadow-w-sm border border-w-border">
       <h2 className="font-w-heading text-w-navy">  // navy heading in Outfit
       <p className="font-w-body text-w-text">       // charcoal body in DM Sans
       <button className="bg-w-orange text-white rounded-w-sm shadow-w-md">
         Hire AI Employee
       </button>
       <span className="text-w-teal">Active</span>  // teal for positive status
     </div>
   </div>
*/

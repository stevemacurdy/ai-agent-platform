# WoulfAI Design System — Quick Reference

## Colors
| Token | Hex | Use |
|-------|-----|-----|
| `w-navy` | `#1B2A4A` | Nav, sidebar, headings, dark sections |
| `w-teal` | `#2A9D8F` | Active states, success, progress, links |
| `w-orange` | `#F5920B` | Primary CTA (1-2 per screen max), alerts |
| `w-bg` | `#F4F5F7` | Page background (never pure white) |
| `w-surface` | `#FFFFFF` | Cards, modals, forms (float on gray) |
| `w-text` | `#1A1A2E` | Body text (never pure black) |
| `w-border` | `#E5E7EB` | Dividers, card borders |
| `w-error` | `#DC4F4F` | Errors, critical (soft red, not pure) |

## Status Colors (override defaults)
- ✅ Success/Active → Teal `#2A9D8F` (not green)
- ⚠️ Warning/Attention → Orange `#F5920B`
- ❌ Error/Critical → Soft Red `#DC4F4F`
- ⏸️ Inactive → Gray `#9CA3AF`
- ℹ️ Info → Light Navy `#3B5278`

## Border Radius
- Buttons, inputs, badges: `8px` (rounded-w-sm)
- Cards, modals, dropdowns: `12px` (rounded-w-md)
- Large containers, sections: `16px` (rounded-w-lg)
- Hero/feature cards: `20px` (rounded-w-xl)
- Pills, avatars, dots: `9999px` (rounded-full)
- **Never** use sharp 90° corners on any interactive element

## Shadows (navy-tinted, always soft)
- `shadow-w-sm` — Cards at rest
- `shadow-w-md` — Cards on hover, elevated elements
- `shadow-w-lg` — Modals, important panels
- `shadow-w-xl` — Overlay modals, hero elements

## Typography
- Headings: **Outfit** (font-w-heading)
- Body: **DM Sans** (font-w-body)
- Heading color: Navy `#1B2A4A`
- Body color: Charcoal `#1A1A2E`

## Spacing (8px grid)
All padding/margin in multiples of 8: 8, 16, 24, 32, 40, 48, 64, 80, 96px

## Orange Rule ⚠️
**Max 1-2 orange elements per screen.** Orange = signal, not decoration.
- ✅ One primary CTA button
- ✅ One notification badge
- ❌ Multiple orange buttons, orange borders AND orange text AND orange icons

## Emotional Checkpoint (before shipping)
1. 🏛️ **Trustworthy?** → Navy grounding the hierarchy
2. 📈 **Progress?** → Teal highlighting momentum
3. 🎯 **Clear action?** → Orange on THE one thing to do
4. 🌬️ **Calm & clear?** → Light gray breathing room
5. 👔 **Business owner confident?** → "Managing my team" not "using tech software"

## CSS Classes Available
```
.w-card              — White card on gray, rounded, shadow
.w-card-interactive  — Adds hover lift
.w-btn-primary       — Orange CTA
.w-btn-secondary     — Navy button
.w-btn-outline       — Navy bordered
.w-btn-ghost         — Subtle text button
.w-badge-success/warning/error/info/neutral
.w-dot-active/warning/error/inactive + .w-dot-pulse
.w-input             — Styled form input with teal focus ring
.w-toast-success/warning/error/info
.w-sidebar           — Navy sidebar
.w-sidebar-item      — Nav item
.w-sidebar-item-active — Teal active state
.w-table             — Navy headers, alternating rows, hover
.w-spinner           — Teal loading spinner
.w-link              — Teal link with hover
.w-hex-bg            — Subtle hexagonal pattern
.w-overlay           — Modal backdrop (navy 60% + blur)
.w-modal             — White modal card
.w-divider-up        — Upward-angled section divider
```

## Files
- `lib/woulfai-theme.js` — Tailwind config extension
- `app/globals.css` — Prepend design-tokens.css content
- This file — Team reference

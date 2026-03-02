#!/usr/bin/env python3
"""P3: Demo Pages — Dark→Light Theme + Agent→Employee Language
Run from: ~/Desktop/ai-ecosystem/ai-agent-platform
Usage: python3 p3-demo-transform.py
"""

import os
import sys

FILES = [
    "app/demo/page.tsx",
    "app/demo/wms-proof-billing/page.tsx",
    "app/demo/sales-field/page.tsx",
    "app/demo/finance-ops/page.tsx",
    "app/demo/marketing/page.tsx",
    "app/demo/customer-support/page.tsx",
    "app/demo/research-intel/page.tsx",
    "app/demo/training/page.tsx",
]

# ORDER MATTERS — longer/more-specific patterns first to avoid partial matches
REPLACEMENTS = [

    # ═══════════════════════════════════════════════════════
    # 1. NAV — dark bg → navy (BEFORE page bg changes)
    # ═══════════════════════════════════════════════════════
    ('bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5',
     'bg-[#1B2A4A]/97 backdrop-blur-xl border-b border-[#1B2A4A]/80'),
    ('bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/10',
     'bg-[#1B2A4A]/97 backdrop-blur-xl border-b border-[#1B2A4A]/80'),

    # ═══════════════════════════════════════════════════════
    # 2. PAGE WRAPPER — dark bg + white text → light bg + navy text
    # ═══════════════════════════════════════════════════════
    ('min-h-screen bg-[#0a0a0f] text-white',
     'min-h-screen bg-[#F4F5F7] text-[#1B2A4A]'),

    # Remaining dark page bg refs
    ('bg-[#0a0a0f]', 'bg-[#F4F5F7]'),
    ('bg-[#0A0E15]', 'bg-[#F4F5F7]'),

    # ═══════════════════════════════════════════════════════
    # 3. MODALS — dark surfaces → white
    # ═══════════════════════════════════════════════════════
    ('bg-[#111118] border border-white/10 rounded-2xl',
     'bg-white border border-gray-200 rounded-2xl shadow-xl'),
    ('bg-[#111118]', 'bg-white'),
    ('bg-[#1a1a24] border border-white/10 rounded-xl',
     'bg-white border border-gray-200 rounded-xl shadow-xl'),
    ('bg-[#1a1a24]', 'bg-white'),

    # Overlay
    ('bg-black/80', 'bg-black/40'),
    ('bg-black/50 backdrop-blur-sm', 'bg-black/30 backdrop-blur-sm'),
    ('bg-black/50', 'bg-black/30'),

    # ═══════════════════════════════════════════════════════
    # 4. INPUTS — dark glass → white with teal focus
    #    (BEFORE generic bg-white/5 changes)
    # ═══════════════════════════════════════════════════════

    # Inputs with various focus colors → teal focus
    ('bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none',
     'bg-white border border-gray-200 rounded-lg focus:border-[#2A9D8F] focus:outline-none focus:ring-1 focus:ring-[#2A9D8F]'),
    ('bg-white/5 border border-white/10 rounded-lg focus:border-emerald-500 focus:outline-none',
     'bg-white border border-gray-200 rounded-lg focus:border-[#2A9D8F] focus:outline-none focus:ring-1 focus:ring-[#2A9D8F]'),
    ('bg-white/5 border border-white/10 rounded-lg focus:border-pink-500 focus:outline-none',
     'bg-white border border-gray-200 rounded-lg focus:border-[#2A9D8F] focus:outline-none focus:ring-1 focus:ring-[#2A9D8F]'),
    ('bg-white/5 border border-white/10 rounded-lg focus:border-violet-500 focus:outline-none',
     'bg-white border border-gray-200 rounded-lg focus:border-[#2A9D8F] focus:outline-none focus:ring-1 focus:ring-[#2A9D8F]'),
    ('bg-white/5 border border-white/10 rounded-lg focus:border-orange-500 focus:outline-none',
     'bg-white border border-gray-200 rounded-lg focus:border-[#2A9D8F] focus:outline-none focus:ring-1 focus:ring-[#2A9D8F]'),
    ('bg-white/5 border border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none',
     'bg-white border border-gray-200 rounded-lg focus:border-[#2A9D8F] focus:outline-none focus:ring-1 focus:ring-[#2A9D8F]'),
    ('bg-white/5 border border-white/10 rounded-xl focus:border-orange-500 focus:outline-none',
     'bg-white border border-gray-200 rounded-xl focus:border-[#2A9D8F] focus:outline-none focus:ring-1 focus:ring-[#2A9D8F]'),
    ('bg-white/5 border border-white/10 rounded-xl focus:border-indigo-500 focus:outline-none',
     'bg-white border border-gray-200 rounded-xl focus:border-[#2A9D8F] focus:outline-none focus:ring-1 focus:ring-[#2A9D8F]'),

    # Textarea with focus
    ('bg-white/5 border border-white/10 rounded-lg resize-none',
     'bg-white border border-gray-200 rounded-lg resize-none'),
    ('bg-white/5 border border-white/10 rounded-lg focus:border-orange-500 focus:outline-none h-24',
     'bg-white border border-gray-200 rounded-lg focus:border-[#2A9D8F] focus:outline-none h-24'),

    # Select/input without focus specified  
    ('py-3 bg-white/5 border border-white/10 rounded-lg',
     'py-3 bg-white border border-gray-200 rounded-lg'),
    ('py-2 bg-white/5 border border-white/10 rounded-lg',
     'py-2 bg-white border border-gray-200 rounded-lg'),

    # Standalone input bg  
    ('px-3 py-2 bg-white/5 border border-white/10 rounded-lg',
     'px-3 py-2 bg-white border border-gray-200 rounded-lg'),

    # ═══════════════════════════════════════════════════════
    # 5. CARDS — glass → white with subtle shadow
    # ═══════════════════════════════════════════════════════

    # Table header rows
    ('border-b border-white/5 bg-white/[0.02]',
     'border-b border-gray-200 bg-gray-50'),

    # Cards with various border radiuses
    ('bg-white/[0.02] border border-white/10 rounded-2xl',
     'bg-white border border-gray-200/60 rounded-2xl shadow-[0_2px_8px_rgba(27,42,74,0.06)]'),
    ('bg-white/[0.02] border border-white/10 rounded-xl',
     'bg-white border border-gray-200/60 rounded-xl shadow-[0_2px_8px_rgba(27,42,74,0.06)]'),
    ('bg-white/[0.02] border border-white/5 rounded-xl',
     'bg-white border border-gray-200/60 rounded-xl shadow-[0_2px_8px_rgba(27,42,74,0.06)]'),
    ('bg-white/[0.02] border border-white/5 rounded-lg',
     'bg-white border border-gray-200/60 rounded-lg'),
    ('bg-white/[0.02] border border-white/10 rounded-lg',
     'bg-white border border-gray-200/60 rounded-lg'),

    # Standalone bg-white/[0.02]
    ('bg-white/[0.02] rounded-lg', 'bg-gray-50 rounded-lg'),
    ('bg-white/[0.02]', 'bg-gray-50'),
    ('bg-white/[0.04]', 'bg-gray-100'),

    # ═══════════════════════════════════════════════════════
    # 6. SUBTLE FILLS — bg-white/N → gray-N
    # ═══════════════════════════════════════════════════════

    # Progress bar backgrounds (before generic bg-white/10)
    ('bg-white/10 rounded-full overflow-hidden', 'bg-gray-200 rounded-full overflow-hidden'),
    ('h-1.5 bg-white/10 rounded-full', 'h-1.5 bg-gray-200 rounded-full'),
    ('h-1 bg-white/20 rounded-full', 'h-1 bg-gray-200 rounded-full'),
    ('h-1 bg-white/10', 'h-1 bg-gray-200'),
    ('h-2 bg-white/10', 'h-2 bg-gray-200'),
    ('h-2 bg-white/20', 'h-2 bg-gray-200'),
    ('w-full h-2 bg-white/10', 'w-full h-2 bg-gray-200'),

    # Specific fills
    ('bg-white/5 rounded-full h-1', 'bg-gray-200 rounded-full h-1'),
    ('bg-white/5 rounded-lg', 'bg-gray-50 rounded-lg'),
    ('bg-white/5 rounded-full', 'bg-gray-100 rounded-full'),
    ('bg-white/5 rounded', 'bg-gray-50 rounded'),
    ('bg-white/10 rounded-lg', 'bg-gray-100 rounded-lg'),
    ('bg-white/10 rounded-full', 'bg-gray-200 rounded-full'),
    ('bg-white/10 rounded', 'bg-gray-100 rounded'),
    ('bg-white/20 rounded', 'bg-gray-200 rounded'),

    # Hover states
    ('hover:bg-white/[0.04]', 'hover:bg-gray-100'),
    ('hover:bg-white/[0.02]', 'hover:bg-gray-50'),
    ('hover:bg-white/20', 'hover:bg-gray-200'),
    ('hover:bg-white/10', 'hover:bg-gray-100'),
    ('hover:bg-white/5', 'hover:bg-gray-50'),

    # Remaining bg-white/5 and bg-white/10
    ('bg-white/5"', 'bg-gray-50"'),
    ('bg-white/5 ', 'bg-gray-50 '),
    ('bg-white/10"', 'bg-gray-100"'),
    ('bg-white/10 ', 'bg-gray-100 '),
    ('bg-white/20"', 'bg-gray-200"'),
    ('bg-white/20 ', 'bg-gray-200 '),

    # ═══════════════════════════════════════════════════════
    # 7. BORDERS
    # ═══════════════════════════════════════════════════════
    ('border-white/5', 'border-gray-200'),
    ('border-white/10', 'border-gray-200'),
    ('border-white/20', 'border-gray-300'),
    ('border-white/30', 'border-gray-300'),
    ('hover:border-white/30', 'hover:border-gray-400'),
    ('hover:border-white/20', 'hover:border-gray-300'),

    # Divider
    ('h-6 w-px bg-gray-100', 'h-6 w-px bg-gray-300'),
    ('w-px bg-gray-100', 'w-px bg-gray-300'),

    # ═══════════════════════════════════════════════════════
    # 8. TEXT COLOR adjustments for light bg
    # ═══════════════════════════════════════════════════════
    ('text-gray-400 hover:text-white', 'text-gray-500 hover:text-[#1B2A4A]'),
    ('hover:text-white transition-colors', 'hover:text-[#1B2A4A] transition-colors'),
    ('hover:text-white transition', 'hover:text-[#1B2A4A] transition'),
    ('hover:text-white"', 'hover:text-[#1B2A4A]"'),
    # Keep small text readable
    ('text-xs text-gray-400', 'text-xs text-gray-500'),
    ('text-sm text-gray-400', 'text-sm text-gray-500'),
    ('text-gray-400 mt-1', 'text-gray-500 mt-1'),

    # ═══════════════════════════════════════════════════════
    # 9. CTA BUTTONS — white-on-black → orange
    # ═══════════════════════════════════════════════════════
    ('bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors',
     'bg-[#F5920B] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#e0850a] transition-colors'),
    ('bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100"',
     'bg-[#F5920B] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#e0850a]"'),
    ('bg-white text-black px-4 py-2 rounded-lg font-medium"',
     'bg-[#F5920B] text-white px-4 py-2 rounded-lg font-medium"'),
    ('bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100',
     'bg-[#F5920B] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#e0850a]'),
    ('bg-white text-black rounded-lg font-medium hover:bg-gray-100"',
     'bg-[#F5920B] text-white rounded-lg font-medium hover:bg-[#e0850a]"'),
    ('bg-white text-black rounded-lg font-medium hover:bg-gray-100',
     'bg-[#F5920B] text-white rounded-lg font-medium hover:bg-[#e0850a]'),
    ('bg-white text-black rounded-lg font-medium"',
     'bg-[#F5920B] text-white rounded-lg font-medium"'),
    ('py-3 bg-white text-black rounded-lg font-medium',
     'py-3 bg-[#F5920B] text-white rounded-lg font-medium'),
    ('px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100',
     'px-6 py-3 bg-[#F5920B] text-white rounded-lg font-medium hover:bg-[#e0850a]'),
    # Research page large button
    ('px-6 py-3 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2',
     'px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-100 flex items-center gap-2'),
    # Small text-sm CTA buttons
    ('bg-white text-black px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-100',
     'bg-[#F5920B] text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#e0850a]'),

    # ═══════════════════════════════════════════════════════
    # 10. DEMO HUB CARDS (page.tsx specific)
    # ═══════════════════════════════════════════════════════
    ('group bg-[#F4F5F7] border',  # was bg-[#0A0E15]
     'group bg-white border'),
    ('hover:border-blue-500/30', 'hover:border-[#2A9D8F]/50'),
    ('hover:shadow-lg hover:shadow-blue-500/5', 'hover:shadow-lg hover:shadow-[#1B2A4A]/8'),
    ('text-white group-hover:text-blue-400', 'text-[#1B2A4A] group-hover:text-[#2A9D8F]'),
    ('text-[10px] text-emerald-400', 'text-[10px] text-[#2A9D8F]'),
    ('bg-blue-500 h-1 rounded-full', 'bg-[#2A9D8F] h-1 rounded-full'),
    ('text-[10px] text-blue-400 opacity-0', 'text-[10px] text-[#2A9D8F] opacity-0'),

    # ═══════════════════════════════════════════════════════
    # 11. "View All →" LINKS — blue → teal
    # ═══════════════════════════════════════════════════════
    ('text-blue-400 hover:text-blue-300">View All', 'text-[#2A9D8F] hover:text-[#238b7f]">View All'),
    ('text-blue-400 hover:text-blue-300">View Details', 'text-[#2A9D8F] hover:text-[#238b7f]">View Details'),
    ('text-blue-400 hover:text-blue-300">View Full', 'text-[#2A9D8F] hover:text-[#238b7f]">View Full'),

    # ═══════════════════════════════════════════════════════
    # 12. AGENT → EMPLOYEE LANGUAGE
    # ═══════════════════════════════════════════════════════

    # Demo hub text
    ('live agents', 'live AI Employees'),
    ('production agent', 'production AI Employee'),

    # Nav titles
    ('>WMS Agent<', '>WMS Employee<'),
    ('>Sales Agent<', '>Sales Employee<'),
    ('>CFO Agent<', '>CFO Employee<'),
    ('>Marketing Agent<', '>Marketing Employee<'),
    ('>Support Agent<', '>Support Employee<'),
    ('>Research Agent<', '>Research Employee<'),
    ('>Training Agent<', '>Training Employee<'),

    # Settings headers
    ('WMS Agent Settings', 'WMS Employee Settings'),
    ('Sales Agent Settings', 'Sales Employee Settings'),
    ('CFO Agent Settings', 'CFO Employee Settings'),
    ('Marketing Agent Settings', 'Marketing Employee Settings'),
    ('Support Agent Settings', 'Support Employee Settings'),
    ('Training Agent Settings', 'Training Employee Settings'),

    # Subtitles
    ('AI Agent Status', 'AI Employee Status'),
    ('>AI Agent Status<', '>AI Employee Status<'),
    ('AI-Powered Sales Assistant', 'AI Sales Employee'),
    ('AI-Powered Campaign Management', 'AI Marketing Employee'),
    ('AI-Powered Customer Service', 'AI Support Employee'),
    ('Company Intelligence & Pre-Call Research', 'AI Research Employee'),
    ('Staff Certification & Onboarding', 'AI Training Employee'),
    ('>Financial Intelligence<', '>AI Financial Employee<'),
    ('>Warehouse Management System<', '>AI WMS Employee<'),

    # Campaign name references
    ('AI Agent Awareness', 'AI Employee Awareness'),
]

def transform_file(filepath):
    if not os.path.exists(filepath):
        print(f"  ⚠️  Skipping {filepath} (not found)")
        return False

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    applied = []
    for old, new in REPLACEMENTS:
        if old in content:
            content = content.replace(old, new)
            applied.append(old[:50])

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✅ {filepath} ({len(applied)} patterns applied)")
        return True
    else:
        print(f"  ℹ️  {filepath} (no changes)")
        return False

def verify_file(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    issues = []
    # Check for remaining dark bg colors
    for pattern in ['#0a0a0f', '#0A0E15', '#111118', '#1a1a24']:
        count = content.count(pattern)
        if count > 0:
            issues.append(f"    ❌ Still has {pattern} ({count}x)")

    # Check for remaining bg-white/N glass effects (excluding legit uses)
    for pattern in ['bg-white/5', 'bg-white/10', 'bg-white/20', 'bg-white/[0.02]']:
        count = content.count(pattern)
        if count > 0:
            issues.append(f"    ⚠️  Still has {pattern} ({count}x)")

    # Check for "Agent" in visible text (not code identifiers)
    for line_num, line in enumerate(content.split('\n'), 1):
        stripped = line.strip()
        # Skip import lines, variable names, hook names, function names
        if any(skip in stripped for skip in ['import ', 'useAgent', 'AgentDemo', 'AgentCategory', 'setAgent', 'selectedAgent', 'function ', 'const ']):
            continue
        # Check for "Agent" in JSX text content
        if '>Agent<' in stripped or "'Agent'" in stripped:
            if 'Employee' not in stripped:
                issues.append(f"    ⚠️  L{line_num}: {stripped[:70]}")

    if issues:
        print(f"  ⚠️  Issues in {filepath}:")
        for issue in issues[:8]:
            print(issue)
    else:
        print(f"  ✅ {filepath} — clean!")

if __name__ == '__main__':
    print("🎨 P3: Demo Pages — Dark→Light + Agent→Employee")
    print("=" * 55)

    changed = 0
    for f in FILES:
        if transform_file(f):
            changed += 1

    print()
    print("🔍 Verification")
    print("=" * 55)
    for f in FILES:
        verify_file(f)

    print()
    print(f"✅ {changed}/{len(FILES)} files transformed")
    print()
    print("Next:")
    print("  npm run build")
    print("  git add app/demo/")
    print('  git commit -m "P3: Design system + Employee language — 8 demo pages"')
    print("  vercel --prod")

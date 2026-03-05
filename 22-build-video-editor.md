# WoulfAI — Build Agent: Video Editor (video-editor)

> Paste the **WoulfAI Context Primer** first, then paste this entire prompt.

---

## WHAT YOU ARE BUILDING

Enhancing the **Video Editor** agent (slug: `video-editor`, dept: Operations, icon: 🎬) — an AI-powered video processing tool with three modes:

1. **Quote Clips** 💬 — Paste a quote, the AI finds the exact timestamp in the video, extracts a clean clip
2. **Power Clips** ⚡ — AI auto-detects the most engaging/marketing-worthy moments and exports multiple clips with burned-in captions
3. **Video Cleanup** ✨ — Normalizes audio levels, corrects color, stabilizes shaky footage, removes dead air

**This agent is ALREADY LIVE.** Both the console and demo page exist and are deployed:
- Console: `https://www.woulfai.com/agents/video-editor/console`
- Demo: `https://www.woulfai.com/demo/video-editor`

**Your job:** Read what exists, then enhance and fill out any gaps to make both pages fully functional, polished, and production-ready. Do NOT break anything that already works.

---

## WHAT IS LIVE RIGHT NOW

### Console (`/agents/video-editor/console`)
Current state:
- Header: 🎬 Video Editor + description
- "Job History" button/link
- Three mode selection cards:
  - Quote Clips 💬 — "Find and extract exact quotes from video" + Select button
  - Power Clips ⚡ — "Auto-detect the best marketing moments" + Select button
  - Video Cleanup ✨ — "Normalize audio, color, and stability" + Select button
- Basic layout — likely needs: upload flow after mode select, processing status, results display, job history page

### Demo (`/demo/video-editor`)
Current state:
- Demo Mode banner
- KPIs (4): Videos Processed (0), Clips Generated (0), Avg Processing (0 min), Hours Saved (0)
  - **Issue:** All KPIs show 0 — the demo data is not populating. Fix this.
- Tabs: Overview, Quote Clips, Power Clips
- Table with 7 demo videos (customer-testimonial-jcpenney.mp4, warehouse-webinar-feb.mp4, etc.) with Mode, Status, Clips, Duration, Date columns
- Action buttons: Upload Video, Extract Quote Clips, Generate Power Clips, Clean Up Video
- 4 AI Recommendation cards (testimonial extraction, webinar repurposing, cleanup, batch processing)
- "Other AI Employees" section at bottom
- Demo vs Full Version comparison

---

## REPO CONTEXT

```bash
cd /home/claude
git clone https://github.com/stevemacurdy/ai-agent-platform.git woulfai
cd woulfai
npm install
```

### First: Map Everything That Exists

```bash
# Find ALL video-editor related files
find . -type f \( -name "*video-editor*" -o -name "*video_editor*" \) | grep -v node_modules | grep -v .next

# Find any videdit remnants (old name — may still have backend code)
find . -type f \( -name "*videdit*" -o -name "*media*" -o -path "*/v1/media/*" \) | grep -v node_modules | grep -v .next

# Read the console page
cat app/agents/video-editor/console/page.tsx 2>/dev/null || cat app/agents/video-editor/page.tsx 2>/dev/null

# Read the demo page data
grep -rn "video-editor" lib/ --include="*.ts" --include="*.tsx" | head -20

# Read the demo page component
find . -path "*/demo*" -name "*.tsx" | xargs grep -l "video-editor\|Video Editor" 2>/dev/null

# Read the API route
find . -path "*/api*" -name "*.ts" | xargs grep -l "video-editor\|video_editor" 2>/dev/null

# Check for worker/Railway integration
grep -rn "railway\|WORKER\|agent22\|whisper\|ffmpeg" --include="*.ts" --include="*.env*" | grep -v node_modules | head -20
```

**READ ALL OUTPUT. Understand the full picture before touching anything.**

### Architecture
- **Framework:** Next.js 14 App Router, TypeScript strict
- **Styling:** Tailwind CSS
- **Fonts:** Outfit (headings), DM Sans (body)
- **Colors:** #1B2A4A (navy), #F5920B (orange), #2A9D8F (teal), #F4F5F7 (bg), #DC2626 (red), #059669 (green)
- **Charts:** Recharts installed
- **Auth:** JWT, authFetch() from lib/auth.ts
- **Database:** Supabase
- **Video Processing:** External Python worker (Whisper + Claude + FFmpeg) — may be on Railway or similar
- **File Storage:** Google Drive for source videos and clips

---

## WHAT NEEDS TO BE FIXED AND BUILT

### Fix 1: Demo Page KPIs Show Zero
The demo page KPIs all display 0. The demo data exists (7 videos in the table) but the KPI values are not being calculated or passed. Fix this:
- Videos Processed: **7** (count of demo videos)
- Clips Generated: **28** (sum: 6+8+1+5+4+1+3)
- Avg Processing: **4.2 min** (realistic for these file sizes)
- Hours Saved: **14** (estimate: ~2hrs saved per video processed)

### Fix 2: Console Upload Flow
After the user selects a mode (Quote Clips / Power Clips / Cleanup), they need an upload experience:

**Quote Clips mode flow:**
1. User selects Quote Clips → mode card highlights
2. Upload area appears: drag-drop video file OR paste Google Drive link OR enter URL
3. **Quote input:** Text field where user pastes the exact quote they want to find
   - Can add multiple quotes (one per line or "Add Another Quote" button)
   - Example: "Since switching to Woulf Group, our fulfillment accuracy went from 94% to 99.6%"
4. "Find & Extract" button submits the job
5. Processing status shows (Uploading → Transcribing → Searching → Extracting → Complete)
6. Results: For each quote found — timestamp, confidence %, preview clip player, download button
7. If quote not found: "Quote not found in this video. Closest match: [partial match text] at [timestamp]"

**Power Clips mode flow:**
1. User selects Power Clips → mode card highlights
2. Upload area appears: drag-drop video file
3. Options:
   - Target platforms: checkboxes for Instagram Reels, TikTok, LinkedIn, YouTube Shorts, Twitter/X
   - Max clips: slider (3-15, default 8)
   - Burn-in captions: toggle (default on)
   - Caption style: dropdown (Bold Bottom / Centered / Karaoke highlight)
4. "Generate Clips" button submits
5. Processing status (Uploading → Transcribing → Analyzing → Generating → Complete)
6. Results: Grid of clip thumbnails, each with:
   - Preview player
   - Timestamp range
   - AI-detected topic/moment description
   - Platform badges (which platforms this clip is sized for)
   - Download button (per clip or download all)
   - Caption preview text

**Video Cleanup mode flow:**
1. User selects Cleanup → mode card highlights
2. Upload area appears
3. Options checkboxes:
   - ☑ Normalize audio levels
   - ☑ Auto color correction
   - ☑ Stabilize shaky footage
   - ☑ Remove dead air / silence trimming
   - ☑ Remove filler words (uh, um, like)
   - Denoising level: slider (None / Light / Medium / Heavy)
4. "Clean Up" button submits
5. Processing status
6. Results: Before/after comparison player (split-screen or toggle), download cleaned video

### Fix 3: Job History Page
The console has a "Job History" button but it needs a full job history view:

- Table: video filename, mode badge (Quote Clips 💬 / Power Clips ⚡ / Cleanup ✨), date, status, clips generated, actions
- Click to expand: see all results for that job, re-download clips, view processing details
- Sortable by date, mode, status
- Filter by mode

### Fix 4: Demo Page Tabs Content
The demo page has tabs (Overview, Quote Clips, Power Clips) but the non-Overview tabs may be thin. Ensure:

**Overview tab:** The current table + KPIs (with values fixed)

**Quote Clips tab:**
- Demo showing extracted quotes from the testimonial videos
- Quote cards with timestamps, text, speaker, clip preview
- Shows what the Quote Clips mode produces

**Power Clips tab:**
- Demo showing auto-detected marketing moments
- Clip grid with thumbnails, captions, platform badges
- Shows what the Power Clips mode produces

---

## DATABASE TABLE

Check what exists first. If no table, create `supabase/migrations/031-video-editor-agent.sql`:

```sql
CREATE TABLE IF NOT EXISTS agent_video_editor_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  title TEXT NOT NULL,
  source_filename TEXT,
  source_url TEXT,
  source_drive_id TEXT,
  duration_seconds INTEGER,
  file_size_mb DECIMAL(10,2),
  mode TEXT NOT NULL CHECK (mode IN ('quote-clips','power-clips','cleanup')),
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued','uploading','transcribing','analyzing','extracting','generating','complete','failed')),
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  -- Quote Clips specific
  input_quotes JSONB DEFAULT '[]',
  found_quotes JSONB DEFAULT '[]',
  -- Power Clips specific
  target_platforms JSONB DEFAULT '[]',
  max_clips INTEGER DEFAULT 8,
  burn_captions BOOLEAN DEFAULT true,
  caption_style TEXT DEFAULT 'bold-bottom',
  detected_moments JSONB DEFAULT '[]',
  -- Cleanup specific
  cleanup_options JSONB DEFAULT '{}',
  -- Results (all modes)
  clips JSONB DEFAULT '[]',
  transcript_text TEXT,
  output_url TEXT,
  output_drive_id TEXT,
  -- Processing metadata
  worker_job_id TEXT,
  error_message TEXT,
  processing_time_seconds INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_video_editor_company ON agent_video_editor_jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_video_editor_status ON agent_video_editor_jobs(status);
CREATE INDEX IF NOT EXISTS idx_video_editor_mode ON agent_video_editor_jobs(mode);
ALTER TABLE agent_video_editor_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company isolation" ON agent_video_editor_jobs FOR ALL
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
```

### Clips JSONB structure (all modes):
```typescript
interface VideoClip {
  id: string;
  filename: string;
  startTime: number;           // seconds
  endTime: number;             // seconds
  duration: number;            // seconds
  fileUrl?: string;
  driveId?: string;
  thumbnailUrl?: string;
  format: 'mp4' | 'webm';
  resolution: string;
  fileSizeMb: number;
  // Quote Clips specific
  quoteText?: string;          // the matched quote
  confidence?: number;         // 0-100 match confidence
  speaker?: string;
  // Power Clips specific
  momentDescription?: string;  // AI description of the moment
  platforms?: string[];        // ['instagram','tiktok','linkedin']
  captionText?: string;        // burned-in caption text
  // Cleanup specific
  appliedFixes?: string[];     // ['audio-norm','color','stabilize','silence-trim']
}
```

---

## API ROUTE

**Check what exists first** under `app/api/agents/video-editor/`. Read it. Preserve it.

Ensure these POST actions exist (add missing ones):

- `submit-quote-clips` — Start a Quote Clips job: `{ sourceUrl, sourceFile, quotes: string[] }`
- `submit-power-clips` — Start a Power Clips job: `{ sourceUrl, sourceFile, platforms, maxClips, burnCaptions, captionStyle }`
- `submit-cleanup` — Start a Cleanup job: `{ sourceUrl, sourceFile, options: {normalizeAudio, colorCorrect, stabilize, removeSilence, removeFillers, denoiseLevel} }`
- `check-status` — Poll job status: `{ jobId }`. Returns status, progress, stage.
- `get-results` — Get completed job results: `{ jobId }`. Returns clips, transcript, output URL.
- `get-history` — Get all jobs for this company, sorted by date.
- `cancel-job` — Cancel a queued/processing job: `{ jobId }`
- `retry-job` — Retry a failed job: `{ jobId }`

---

## DEMO DATA (fix the zeros)

The demo data file (probably in `lib/demo-data.ts` or `lib/video-editor-data.ts`) needs to provide actual values. Find where the demo page reads data and make sure these values are populated:

### Demo KPIs:
```typescript
{
  videosProcessed: 7,
  clipsGenerated: 28,
  avgProcessingMinutes: 4.2,
  hoursSaved: 14
}
```

### Demo Videos (match what's already in the table):
```typescript
[
  { file: 'customer-testimonial-jcpenney.mp4', mode: 'Quote Clips', status: 'Complete', clips: 6, duration: '22:14', date: '2026-02-28' },
  { file: 'warehouse-webinar-feb.mp4', mode: 'Power Clips', status: 'Complete', clips: 8, duration: '45:30', date: '2026-02-27' },
  { file: 'tradeshow-booth-walk.mov', mode: 'Cleanup', status: 'Complete', clips: 1, duration: '3:42', date: '2026-02-26' },
  { file: 'q4-sales-kickoff.mp4', mode: 'Power Clips', status: 'Complete', clips: 5, duration: '32:10', date: '2026-02-25' },
  { file: 'ceo-interview-raw.mov', mode: 'Quote Clips', status: 'Complete', clips: 4, duration: '18:55', date: '2026-02-24' },
  { file: 'product-demo-v3.mp4', mode: 'Cleanup', status: 'Complete', clips: 1, duration: '8:20', date: '2026-02-23' },
  { file: 'client-call-recording.mp4', mode: 'Quote Clips', status: 'Complete', clips: 3, duration: '14:08', date: '2026-02-22' },
]
```

### Demo Quote Clips results (for Quote Clips tab on demo page):
```typescript
[
  { quote: "Our fulfillment accuracy went from 94% to 99.6% — that's a game changer.", speaker: "VP Operations, JCPenney", timestamp: "4:32", confidence: 98, video: 'customer-testimonial-jcpenney.mp4' },
  { quote: "We were shipping 200 orders a day. Now we're at 450 with the same headcount.", speaker: "VP Operations, JCPenney", timestamp: "8:17", confidence: 96, video: 'customer-testimonial-jcpenney.mp4' },
  { quote: "The team had us fully operational within three weeks.", speaker: "VP Operations, JCPenney", timestamp: "12:41", confidence: 94, video: 'customer-testimonial-jcpenney.mp4' },
  { quote: "I was honestly skeptical about AI in warehouse operations. Six months in, I can't imagine going back.", speaker: "CEO, BuildRight", timestamp: "6:12", confidence: 91, video: 'ceo-interview-raw.mov' },
  { quote: "Returns dropped 40% because orders are right the first time.", speaker: "Dir. Supply Chain, Summit Retail", timestamp: "9:44", confidence: 97, video: 'client-call-recording.mp4' },
]
```

### Demo Power Clips results (for Power Clips tab on demo page):
```typescript
[
  { moment: "Key ROI reveal — audience reaction", timestamp: "12:30-12:47", duration: '0:17', platforms: ['instagram','tiktok','linkedin'], caption: "450 orders/day with the same team 🚀", video: 'warehouse-webinar-feb.mp4' },
  { moment: "Live system demo — real-time dashboard", timestamp: "18:22-18:45", duration: '0:23', platforms: ['linkedin','youtube'], caption: "See every pallet, every zone, in real time", video: 'warehouse-webinar-feb.mp4' },
  { moment: "Customer testimonial callout", timestamp: "31:05-31:22", duration: '0:17', platforms: ['instagram','tiktok'], caption: "99.6% accuracy. Zero excuses.", video: 'warehouse-webinar-feb.mp4' },
  { moment: "CEO passion statement on automation", timestamp: "2:18-2:41", duration: '0:23', platforms: ['linkedin','twitter'], caption: "This is what warehouse automation actually looks like", video: 'q4-sales-kickoff.mp4' },
  { moment: "Before/after warehouse transformation", timestamp: "14:55-15:20", duration: '0:25', platforms: ['instagram','tiktok','linkedin'], caption: "From chaos to clockwork in 3 weeks", video: 'q4-sales-kickoff.mp4' },
]
```

---

## CONSOLE ENHANCEMENTS

### Processing Status UI
When a job is processing, show a pipeline visualization:

**Quote Clips pipeline:**
```
Uploading → Transcribing → Searching Quotes → Extracting Clips → Complete
   🔵          🔵⚡              🟣                 🟠              🟢
```

**Power Clips pipeline:**
```
Uploading → Transcribing → Detecting Moments → Generating Clips → Complete
   🔵          🔵⚡              🟣                   🟠            🟢
```

**Cleanup pipeline:**
```
Uploading → Analyzing → Applying Fixes → Rendering → Complete
   🔵         🟣            🟠            🟠          🟢
```

Show animated progress bar with current stage label. Progress mapping:
- Uploading: 0-15%
- Transcribing/Analyzing: 15-45%
- Searching/Detecting/Applying: 45-75%
- Extracting/Generating/Rendering: 75-95%
- Complete: 100%

### Results Display

**Quote Clips results:**
- Card per found quote: quote text, speaker, timestamp, confidence % badge (green >90%, yellow 70-90%, red <70%)
- Inline video player preview per clip
- Download individual clip button
- "Quote not found" state with closest match suggestion

**Power Clips results:**
- Grid of clip thumbnails
- Each: preview player, AI moment description, platform badges, caption text overlay
- "Download All" button (zip) + individual download per clip
- Platform-specific aspect ratio indicators (9:16 for Reels/TikTok, 1:1 for Instagram, 16:9 for LinkedIn/YouTube)

**Cleanup results:**
- Side-by-side or toggle before/after player
- Applied fixes checklist (which options were applied)
- Download cleaned video button
- File size comparison (original vs cleaned)

---

## VIDEDIT CLEANUP

The old `videdit` slug is dead. If any files reference it:

```bash
grep -rn "videdit\|Videdit" --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v .next
```

If found in active code (not just the old worker repo), update references to `video-editor`. If it's just leftover files that aren't imported anywhere, leave them — they won't affect the build.

Do NOT touch the `WoulfGroup/agent22-worker` Railway repo — that's a separate codebase. If the video-editor routes proxy to it, preserve those connections.

---

## RULES

1. **Output a single `generate-agent-video-editor.js` script** run from project root
2. **`npm run build` must pass** with zero errors
3. **No unicode escape sequences in JSX**
4. **READ all existing files before modifying** — the console and demo already exist
5. **PRESERVE all existing integrations** — worker connections, API proxies, auth flows
6. **Fix the demo KPIs** — they must show actual values, not zeros
7. **The three modes must each have a complete upload → process → results flow**
8. **Demo fallback** on console when no live data
9. **Live/Demo badge** on both console and demo page

---

## OUTPUT FILES

The script creates/updates (check existence before creating):

1. `supabase/migrations/031-video-editor-agent.sql` — table (only if no table exists)
2. `app/api/agents/video-editor/route.ts` — enhanced route with all POST actions (preserve existing)
3. `app/agents/video-editor/console/page.tsx` — enhanced console with full upload flows and results display
4. `app/agents/video-editor/console/history/page.tsx` — job history page (if doesn't exist)
5. Demo data fixes in whichever file provides data to `/demo/video-editor` (find it, fix the zeros)

**Before creating any file, check if it already exists and READ it. Modify, don't replace.**

---

## THE ULTIMATE TEST

### Test 1: Demo Page
A prospect visits `/demo/video-editor` for the first time:
1. KPIs show **7 videos processed, 28 clips generated, 4.2 min avg, 14 hours saved** — not zeros
2. Table shows 7 demo videos with mode badges (Quote Clips 💬, Power Clips ⚡, Cleanup ✨)
3. Quote Clips tab shows 5 extracted quotes with timestamps and confidence scores
4. Power Clips tab shows 5 auto-detected moments with platform badges and captions
5. AI recommendations are compelling — "Turn your 30-min webinar into 8 social media clips"
6. They click "Start Free Trial"

**If a marketing manager would sign up after seeing this demo, it passes.**

### Test 2: Console — Quote Clips
A user logs in and wants to extract a specific client quote from a testimonial video:
1. Selects "Quote Clips" mode — card highlights
2. Drags in `customer-testimonial.mp4`
3. Pastes: "Our fulfillment accuracy went from 94% to 99.6%"
4. Adds another: "We were shipping 200 orders a day"
5. Clicks "Find & Extract"
6. Sees pipeline: Uploading → Transcribing → Searching → Extracting
7. Results: Both quotes found — 98% and 96% confidence, with clip previews
8. Downloads both clips for a LinkedIn post

**If they'd stop manually scrubbing through 22-minute videos to find quotes, it passes.**

### Test 3: Console — Power Clips
A user uploads a 45-minute webinar recording:
1. Selects "Power Clips" mode
2. Uploads the video
3. Checks Instagram Reels + TikTok + LinkedIn
4. Sets max clips to 8, captions on, Bold Bottom style
5. Clicks "Generate Clips"
6. Gets back 8 clips: each with a thumbnail, moment description, platform badges, caption text
7. Downloads all as a zip — ready to schedule across social media

**If they'd use this instead of hiring a video editor for $50/hour, it passes.**

### Test 4: Console — Cleanup
A user uploads shaky trade show footage from their phone:
1. Selects "Video Cleanup" mode
2. Uploads the video
3. Checks: normalize audio, color correct, stabilize, remove dead air
4. Clicks "Clean Up"
5. Gets a before/after comparison — night and day difference
6. Downloads the cleaned version for the website

**If the cleaned video looks professional enough for a landing page, it passes.**

---

## FINAL CHECKLIST

- [ ] Demo page KPIs show actual values (7, 28, 4.2, 14) — NOT zeros
- [ ] Demo page Quote Clips tab shows extracted quotes with data
- [ ] Demo page Power Clips tab shows detected moments with data
- [ ] Console: Quote Clips mode has full flow (select → upload → paste quotes → process → results)
- [ ] Console: Power Clips mode has full flow (select → upload → options → process → results grid)
- [ ] Console: Cleanup mode has full flow (select → upload → options → process → before/after)
- [ ] Job History page shows all past jobs sortable by date/mode/status
- [ ] Processing pipeline animation with stage labels and progress bar
- [ ] Results display: clip previews, download buttons, confidence scores (quote clips)
- [ ] Results display: platform badges, captions, thumbnails (power clips)
- [ ] Results display: before/after comparison (cleanup)
- [ ] All existing integrations preserved (worker, API proxies, auth)
- [ ] `npm run build` passes with zero errors
- [ ] No unicode escapes in JSX
- [ ] No placeholder text — all demo data is realistic
- [ ] Mobile responsive

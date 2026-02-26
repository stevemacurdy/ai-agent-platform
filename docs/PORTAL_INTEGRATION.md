# Agent #22: Portal Integration Notes

## Screens Required

### 1. Settings → Integrations → Google Drive

**Route:** `/settings/integrations`

**Components:**
- `DriveConnectionCard` — shows connected Google email, root folder, last sync time
- "Connect Google Drive" button → calls `POST /api/v1/media/drive/connect` → redirects to Google OAuth
- "Disconnect" button (admin only) → calls `DELETE /api/v1/media/drive`
- Folder picker (optional) — set root_folder_id after connecting

**Permissions:** Company admins only can connect/disconnect. All users can view status.

### 2. Media Agent → Jobs List

**Route:** `/agents/media-quotes` or `/media/jobs`

**Components:**
- `MediaJobsList` — paginated table of all jobs for the company
- Columns: Status (badge), Created, Files (count), Quotes (count), Cost, Creator
- Status filter tabs: All | Processing | Completed | Failed
- "New Extraction" button → opens create job modal
- Auto-refresh when any jobs are `queued` or `processing` (poll every 5s)

**API:** `GET /api/v1/media/jobs?status=...&page=...`

### 3. Media Agent → Create Job Modal

**Components:**
- `CreateJobModal`
- Drive folder browser (list folders from connected Drive)
- OR manual file ID input
- Quote criteria textarea (with default)
- Max quotes slider (1-15, default 10)
- Clip padding slider (0-5s, default 1.5s)
- Context notes textarea (optional)
- Estimated cost display
- "Start Extraction" button

**API:** `POST /api/v1/media/jobs`

### 4. Media Agent → Job Detail

**Route:** `/agents/media-quotes/[jobId]`

**Components:**
- `JobDetailHeader` — status, progress bar, timing, cost
- `FilesList` — accordion of each file with its status, transcript snippet
- `QuotesGallery` — grid/list of extracted quotes per file
  - Each quote card: text, speaker, score badge, category tag, timestamps
  - Play button → plays the video clip inline (signed URL)
  - Download buttons → video and audio separately
- `TranscriptViewer` — full transcript with highlighted quote regions
- Bulk download button (zip all clips)

**API:**
- `GET /api/v1/media/jobs/:jobId` (full nested response)
- `GET /api/v1/media/clips/:clipId/download` (signed URL)

### 5. Media Agent → Outputs Gallery (cross-job)

**Route:** `/agents/media-quotes/gallery`

**Components:**
- `QuotesGallery` — search/filter all quotes across all jobs
- Filter by: category, score, speaker, date range
- Full-text search on quote text
- Inline video player + download

**API:** Could be a new `GET /api/v1/media/quotes?search=...&category=...` endpoint.

## Auth & Permissions Matrix

| Action | User | Admin |
|---|---|---|
| View jobs | ✅ | ✅ |
| Create job | ✅ | ✅ |
| Cancel queued job | ❌ | ✅ |
| View job detail | ✅ | ✅ |
| Download clips | ✅ | ✅ |
| Connect Drive | ❌ | ✅ |
| Disconnect Drive | ❌ | ✅ |
| View audit logs | ❌ | ✅ |

## Real-Time Progress

For showing live progress while a job runs:
- **Option A (simple):** Poll `GET /api/v1/media/jobs/:jobId` every 3-5 seconds. The worker updates `progress_pct` and `progress_message` in real-time.
- **Option B (future):** Supabase Realtime subscription on `media_jobs` table filtered by `id`.

Recommendation: Start with polling. It's simpler and the worker already updates progress frequently.

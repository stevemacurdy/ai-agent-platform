# Agent #22: Launch Readiness Gate

## Pre-Deploy Checklist

### Infrastructure
- [ ] Supabase migrations run successfully (both SQL files)
- [ ] `claim_media_job` RPC function created and granted to service_role only
- [ ] `media-clips` storage bucket created with RLS policy
- [ ] Worker container deployed (Railway/Fly.io/VPS) with all env vars
- [ ] FFmpeg verified in worker container (`ffmpeg -version`)
- [ ] Sentry project created, DSN configured in both Vercel and worker

### Secrets & Security
- [ ] `DRIVE_TOKEN_ENCRYPTION_KEY` generated: `openssl rand -hex 32`
- [ ] Key stored in worker env vars ONLY (not in Vercel, not in code)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` in worker env vars ONLY
- [ ] `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` in worker env vars ONLY
- [ ] Google Cloud OAuth2 Web Application credentials created
- [ ] Redirect URI matches exactly: `https://app.woulfai.com/api/v1/media/drive/callback`
- [ ] Google Drive API enabled in Cloud Console
- [ ] Verify: no secrets in client-side code or git

### Google Drive OAuth
- [ ] OAuth consent screen configured (internal or external as needed)
- [ ] Scopes: `drive.readonly` + `userinfo.email` (least privilege)
- [ ] Test: Company admin can connect Drive → authorize → callback saves encrypted token
- [ ] Test: Token refresh works (wait for access token to expire, trigger a job)
- [ ] Test: Disconnect revokes access and marks connection inactive

### Database & RLS
- [ ] Run migration on a test project first
- [ ] Verify RLS: User from Company A cannot see Company B's jobs (test with two accounts)
- [ ] Verify: `media_audit_logs` are insert-only from service_role
- [ ] Verify: `FOR UPDATE SKIP LOCKED` works with `claim_media_job` RPC
- [ ] Verify: `cleanup_stale_media_jobs()` correctly fails stuck jobs

### Worker Pipeline — Smoke Test
Run with a REAL short interview video (<5 min):

- [ ] Worker starts and polls successfully (check logs)
- [ ] Job claimed from queue (status: queued → processing)
- [ ] File downloaded from Google Drive
- [ ] SHA-256 checksum computed and stored
- [ ] Audio extracted from video via FFmpeg
- [ ] Whisper transcription completes with segments
- [ ] Transcript text and segments stored in `media_files`
- [ ] Claude identifies quotes with scores and categories
- [ ] Quotes stored in `media_quotes`
- [ ] Video clips cut at correct timestamps (verify ±2s accuracy)
- [ ] Audio clips cut at correct timestamps
- [ ] Clips uploaded to Supabase Storage at `{company_id}/{job_id}/{file_id}/`
- [ ] Clip records in `media_clips` with correct storage_path
- [ ] Job status: completed, progress: 100%, cost calculated
- [ ] Audit logs written for all pipeline stages
- [ ] Temp files cleaned up after processing

### API Endpoints — Smoke Test
- [ ] `POST /api/v1/media/jobs` — creates job, returns 201
- [ ] `POST /api/v1/media/jobs` with duplicate idempotency_key — returns existing job
- [ ] `POST /api/v1/media/jobs` without Drive connected — returns 400
- [ ] `POST /api/v1/media/jobs` with 25 file IDs — returns 400 (max 20)
- [ ] `GET /api/v1/media/jobs` — lists only own company's jobs
- [ ] `GET /api/v1/media/jobs/:id` — returns full nested detail
- [ ] `DELETE /api/v1/media/jobs/:id` — cancels queued job only
- [ ] `GET /api/v1/media/clips/:id/download` — returns signed URL, logs in audit
- [ ] Rate limiting: 6th job in 1 hour → 429

### Failure & Recovery
- [ ] Test: Worker crashes mid-job → job stays `processing` with `locked_at`
- [ ] Test: After 2 hours, `cleanup_stale_media_jobs` marks it `failed`
- [ ] Test: One file in a 3-file job fails → job status = `partial`, other files complete
- [ ] Test: Invalid Drive file ID → file marked `failed`, job continues
- [ ] Test: Whisper API timeout → retried 3x, then file marked `failed`

### Cost Controls
- [ ] Files >2GB rejected at download
- [ ] Clips >120s are capped
- [ ] Clips <3s are skipped
- [ ] Max 15 quotes per file enforced
- [ ] Rate limit: 5 jobs/hour/company

### Preview Environment Safety
- [ ] Worker DOES NOT run in preview (only production/staging)
- [ ] Preview deploys use test Supabase project (separate from prod)
- [ ] API routes in preview don't trigger real Drive access
- [ ] No production Google OAuth credentials in preview env

## Post-Launch Monitoring (First 48 Hours)
- [ ] Sentry: no unhandled exceptions
- [ ] Worker logs: no repeated errors
- [ ] DB: no orphaned jobs (stuck in `processing` forever)
- [ ] Storage: clips accessible via signed URLs
- [ ] Costs: actual vs estimated within 20%
- [ ] User feedback: quotes are relevant and clips are clean

## Sign-Off
- [ ] Engineering review of security (tokens, RLS, secrets)
- [ ] Smoke test passed by someone other than the builder
- [ ] README and architecture docs match deployed code

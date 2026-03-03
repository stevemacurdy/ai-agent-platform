# Video Editor Agent — Deployment Guide

## Step 1: Database Migration

1. Open the Supabase SQL Editor for your project.
2. Paste and run the contents of `supabase/migrations/024-video-editor.sql`.
3. Create two storage buckets in Supabase Storage:
   - **video-uploads** — Private (authenticated write only)
   - **video-outputs** — Public read, authenticated write

## Step 2: Deploy the Python Worker to Railway

```bash
cd video-editor-worker
git init
git remote add origin https://github.com/WoulfGroup/video-editor-worker.git
git add -A
git commit -m "init: video editor worker"
git push -u origin main
```

In Railway:

1. New Project > Deploy from GitHub > WoulfGroup/video-editor-worker
2. Add environment variables:
   - `OPENAI_API_KEY` — your OpenAI API key
   - `SUPABASE_URL` — your Supabase project URL
   - `SUPABASE_KEY` — Supabase service role key (NOT the anon key)
   - `WORKER_SECRET` — generate a random 32-character string
3. Deploy and note the public URL (e.g. `https://video-editor-worker-production.up.railway.app`)

## Step 3: Configure the Platform

In the `ai-agent-platform` repo, add to `.env.local`:

```env
VIDEO_WORKER_URL=https://video-editor-worker-production.up.railway.app
WORKER_SECRET=same-secret-as-railway
```

Then build and deploy:

```bash
npm run build
git add -A
git commit -m "feat: video editor agent"
git push
```

Vercel will auto-deploy from the push.

## Step 4: Verify

1. Visit `/agents/video-editor/console`
2. Upload a short test video (30 seconds is fine)
3. **Test Quote mode:** let it transcribe, enter a quote from the transcript, extract
4. **Test Power mode:** generate auto-clips with captions
5. **Test Cleanup mode:** normalize audio and color correct
6. Visit `/demo/video-editor` to confirm the demo page works for unauthenticated visitors

## Architecture Summary

```
Frontend Console                          Python Worker (Railway)
/agents/video-editor/console              POST /process
        |                                 POST /transcribe-only
        | upload via /api/.../upload      GET  /health
        | submit via POST /api/.../
        | poll via GET /api/...?job=X     Supabase Storage
        |                                 bucket: video-uploads (input)
   API Routes (Next.js)                   bucket: video-outputs (output)
   /api/agents/video-editor/
   /api/agents/video-editor/upload/       Database
   /api/agents/video-editor/transcribe/   table: video_jobs
   /api/agents/video-editor/callback/     table: video_clips
```

## Environment Variables Summary

| Variable | Where | Purpose |
|----------|-------|---------|
| `VIDEO_WORKER_URL` | Vercel | URL of the Railway worker |
| `WORKER_SECRET` | Vercel + Railway | Shared auth secret |
| `OPENAI_API_KEY` | Railway | Whisper transcription |
| `SUPABASE_URL` | Railway | Database + storage access |
| `SUPABASE_KEY` | Railway | Service role key |

## Cost Estimates

| Component | Cost |
|-----------|------|
| Whisper transcription | ~$0.006/min of audio |
| FFmpeg processing (Railway) | ~$0.01/min |
| Storage (Supabase) | ~$0.015/GB/month |
| **10-min video total** | **~$0.10-0.15** |

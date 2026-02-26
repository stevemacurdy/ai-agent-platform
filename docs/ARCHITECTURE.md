# Agent #22: Videdit Agent — Architecture Spec

## 1. System Overview

A multi-tenant video quote extraction pipeline integrated into the WoulfAI platform (Next.js + Supabase + Vercel). Companies authorize Google Drive access, point the agent at interview folders, and receive AI-selected quote clips — all tenant-isolated.

### Components

| Component | Runs On | Role |
|---|---|---|
| **API Layer** | Vercel (Next.js API Routes) | Job CRUD, auth, signed URL generation, webhook receiver |
| **Worker Service** | Dedicated VM or Railway/Fly.io container | Polls job queue, runs pipeline (download → transcribe → extract → clip → upload) |
| **Supabase** | Managed | Postgres DB (RLS), Storage (clip files), Auth (JWT validation) |
| **Google Drive** | External | Source video files, per-company OAuth2 |
| **OpenAI Whisper API** | External | Transcription |
| **Anthropic Claude API** | External | Quote extraction intelligence |
| **Sentry** | External | Error tracking with tenant context |

### Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  PORTAL (Next.js on Vercel)                                         │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌──────────────────┐  │
│  │ Drive    │  │ Create   │  │ Job Detail │  │ Outputs Gallery  │  │
│  │ Connect  │  │ Job      │  │ + Progress │  │ + Download       │  │
│  └────┬─────┘  └────┬─────┘  └─────┬──────┘  └────────┬─────────┘  │
│       │              │              │                   │            │
│       ▼              ▼              ▼                   ▼            │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  API Routes (/api/v1/media/*)                                │   │
│  │  - Auth middleware (JWT + company_id)                         │   │
│  │  - Rate limiting                                              │   │
│  │  - Input validation                                           │   │
│  └──────────────────────┬───────────────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│  SUPABASE                                                           │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐  │
│  │ Postgres (RLS enforced)     │  │ Storage (Buckets)           │  │
│  │ - media_jobs                │  │ - media-clips/{company_id}/ │  │
│  │ - media_files               │  │                             │  │
│  │ - media_quotes              │  │ RLS: company_id match only  │  │
│  │ - media_clips               │  └─────────────────────────────┘  │
│  │ - company_drive_connections │                                    │
│  │ - audit_logs                │                                    │
│  └──────────────┬──────────────┘                                    │
└─────────────────┼───────────────────────────────────────────────────┘
                  │
                  ▼ (polls for status='queued')
┌─────────────────────────────────────────────────────────────────────┐
│  WORKER SERVICE (dedicated container — NOT Vercel)                   │
│                                                                      │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌───────┐  ┌────────┐ │
│  │ Download │→ │ Transcribe│→ │ Extract  │→ │  Cut  │→ │ Upload │ │
│  │ (Drive)  │  │ (Whisper) │  │ (Claude) │  │(FFmpeg)│  │(Supa)  │ │
│  └──────────┘  └───────────┘  └──────────┘  └───────┘  └────────┘ │
│                                                                      │
│  - Polls Supabase every 5s for queued jobs                          │
│  - Updates status + progress in real-time                           │
│  - Writes audit log entries                                         │
│  - Retries transient failures (3x exponential backoff)              │
└─────────────────────────────────────────────────────────────────────┘
```

## 2. Tenancy Boundaries

| Layer | Enforcement |
|---|---|
| API | Every request extracts `company_id` from JWT. All queries include `company_id` filter. |
| Database | RLS policies on ALL tables require `auth.jwt() ->> 'company_id' = company_id::text`. |
| Storage | Clips stored at `media-clips/{company_id}/{job_id}/`. RLS on bucket. |
| Worker | Loads `company_id` from job record. All downstream operations scoped. |
| Drive | Each company has its own OAuth token. Tokens encrypted at rest. |

**Cross-tenant access is impossible** at every layer: API filters, DB RLS, storage paths, and worker scoping.

## 3. Worker Architecture Decision

**Choice: Supabase polling worker (dedicated container)**

Reasoning:
- Steve's stack is Vercel + Supabase. Vercel has a 60s function timeout (300s on Pro) — far too short for video processing.
- Redis/BullMQ adds infrastructure complexity for no benefit at current scale.
- A single Python container (Railway, Fly.io, or a $5 VPS) polling `media_jobs WHERE status = 'queued' ORDER BY created_at LIMIT 1 FOR UPDATE SKIP LOCKED` is the simplest production-appropriate pattern.
- Postgres `FOR UPDATE SKIP LOCKED` gives us safe concurrent worker scaling later with zero additional infrastructure.
- The worker uses `SUPABASE_SERVICE_ROLE_KEY` (never exposed to client) to bypass RLS for status updates, but ALL data writes include explicit `company_id`.

## 4. Failure Modes & Retries

| Failure | Handling |
|---|---|
| Drive download fails | Retry 3x with exponential backoff (2s, 8s, 32s). Mark file as `error` after exhaustion. |
| Whisper API timeout | Retry 2x. On failure, mark file `transcription_failed`, continue other files. |
| Claude API error | Retry 2x. On failure, transcript is still saved — quotes can be re-extracted. |
| FFmpeg crash | Mark individual clip as failed. Other clips continue. |
| Supabase Storage upload fails | Retry 3x. On failure, local clip is preserved; job marked `partial`. |
| Worker crash mid-job | Job stays `processing` with `locked_at` timestamp. Stale lock detector requeues after 30 min. |

**Partial failure**: If 3/6 files succeed, job status = `partial`. Each file has its own status. The portal shows per-file results.

## 5. Cost Controls

| Control | Implementation |
|---|---|
| Max files per job | 20 (configurable per company tier) |
| Max file size | 2GB per file |
| Max clip duration | 120 seconds (prevents runaway FFmpeg) |
| Min clip duration | 3 seconds (prevents trivial clips) |
| Max quotes per file | 15 |
| Clip padding | 1.5s default, max 5s |
| Rate limit | 5 jobs/hour per company |
| Whisper cost guard | Estimated cost shown before confirmation; hard cap at $50/job |
| Stale job cleanup | Jobs in `processing` for >2 hours are auto-failed |

## 6. Secrets Management

| Secret | Where Stored | Access |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Worker env vars (Railway/Fly secrets) | Worker only, never in Vercel client bundle |
| `OPENAI_API_KEY` | Worker env vars | Worker only |
| `ANTHROPIC_API_KEY` | Worker env vars | Worker only |
| `DRIVE_TOKEN_ENCRYPTION_KEY` | Worker env vars | Worker only — AES-256-GCM key for encrypting refresh tokens |
| `SENTRY_DSN` | Both Vercel + Worker env vars | Both |
| Company Drive refresh tokens | Supabase `company_drive_connections.encrypted_refresh_token` | Encrypted with `DRIVE_TOKEN_ENCRYPTION_KEY` |

**Encryption approach for Drive tokens**: AES-256-GCM with a 256-bit key stored ONLY in the worker's environment variables. The encrypted blob + IV + auth tag are stored in Supabase. Even if the database is compromised, tokens are useless without the key. Key rotation: re-encrypt all tokens with new key, deploy, delete old key.

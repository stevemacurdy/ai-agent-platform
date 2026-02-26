-- =============================================================================
-- Agent #22: Videdit Agent — Database Schema
-- Migration: 20260223_agent22_media_quote_extractor.sql
--
-- Run via: supabase db push  (or paste into Supabase SQL editor)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- for text search on quotes

-- ---------------------------------------------------------------------------
-- 1. ENUM types
-- ---------------------------------------------------------------------------
CREATE TYPE media_job_status AS ENUM (
  'queued',
  'processing',
  'completed',
  'partial',      -- some files succeeded, some failed
  'failed',
  'cancelled'
);

CREATE TYPE media_file_status AS ENUM (
  'pending',
  'downloading',
  'transcribing',
  'extracting_quotes',
  'cutting_clips',
  'uploading_clips',
  'completed',
  'failed'
);

CREATE TYPE media_clip_type AS ENUM (
  'video',
  'audio'
);

CREATE TYPE audit_action AS ENUM (
  'job_created',
  'job_started',
  'job_completed',
  'job_failed',
  'file_accessed',
  'file_transcribed',
  'clip_generated',
  'clip_downloaded',
  'drive_connected',
  'drive_disconnected'
);

-- ---------------------------------------------------------------------------
-- 2. Company Drive Connections (per-company Google OAuth)
-- ---------------------------------------------------------------------------
CREATE TABLE company_drive_connections (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id              UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  connected_by_user_id    UUID NOT NULL REFERENCES auth.users(id),

  -- OAuth2 tokens — refresh token is AES-256-GCM encrypted
  -- Plaintext access token is short-lived (1hr), acceptable to store temporarily
  encrypted_refresh_token TEXT NOT NULL,          -- base64(iv + ciphertext + tag)
  access_token            TEXT,                   -- current access token (ephemeral)
  token_expires_at        TIMESTAMPTZ,

  -- Drive config
  root_folder_id          TEXT,                   -- default folder to watch
  root_folder_name        TEXT,
  google_email            TEXT,                   -- which Google account authorized

  -- Metadata
  is_active               BOOLEAN DEFAULT TRUE,
  last_synced_at          TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT uq_company_drive UNIQUE (company_id)  -- one connection per company
);

CREATE INDEX idx_drive_conn_company ON company_drive_connections(company_id);

-- RLS
ALTER TABLE company_drive_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "company_drive_connections_select"
  ON company_drive_connections FOR SELECT
  USING (company_id::text = auth.jwt() ->> 'company_id');

CREATE POLICY "company_drive_connections_insert"
  ON company_drive_connections FOR INSERT
  WITH CHECK (company_id::text = auth.jwt() ->> 'company_id');

CREATE POLICY "company_drive_connections_update"
  ON company_drive_connections FOR UPDATE
  USING (company_id::text = auth.jwt() ->> 'company_id');

CREATE POLICY "company_drive_connections_delete"
  ON company_drive_connections FOR DELETE
  USING (company_id::text = auth.jwt() ->> 'company_id');

-- ---------------------------------------------------------------------------
-- 3. Media Jobs
-- ---------------------------------------------------------------------------
CREATE TABLE media_jobs (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id              UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_by_user_id      UUID NOT NULL REFERENCES auth.users(id),

  -- Job config
  status                  media_job_status NOT NULL DEFAULT 'queued',
  quote_criteria          TEXT NOT NULL DEFAULT 'client testimonial quotes highlighting results, satisfaction, or transformation',
  max_quotes_per_file     INT NOT NULL DEFAULT 10 CHECK (max_quotes_per_file BETWEEN 1 AND 15),
  clip_padding_seconds    NUMERIC(4,2) NOT NULL DEFAULT 1.5 CHECK (clip_padding_seconds BETWEEN 0 AND 5),
  context_notes           TEXT,                   -- optional context about interviews

  -- Source
  drive_folder_id         TEXT,                   -- if processing a folder
  drive_file_ids          TEXT[],                 -- if processing specific files

  -- Progress
  progress_pct            INT DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  progress_message        TEXT DEFAULT 'Queued',
  total_files             INT DEFAULT 0,
  completed_files         INT DEFAULT 0,
  failed_files            INT DEFAULT 0,

  -- Cost tracking
  estimated_cost_usd      NUMERIC(8,4),
  actual_cost_usd         NUMERIC(8,4),

  -- Worker locking (prevents double-processing)
  locked_by               TEXT,                   -- worker instance ID
  locked_at               TIMESTAMPTZ,

  -- Timestamps
  started_at              TIMESTAMPTZ,
  completed_at            TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW(),

  -- Idempotency
  idempotency_key         TEXT,                   -- optional client-provided key
  CONSTRAINT uq_idempotency UNIQUE (company_id, idempotency_key)
);

CREATE INDEX idx_jobs_company ON media_jobs(company_id);
CREATE INDEX idx_jobs_status ON media_jobs(status) WHERE status = 'queued';
CREATE INDEX idx_jobs_locked ON media_jobs(locked_at) WHERE status = 'processing';
CREATE INDEX idx_jobs_created ON media_jobs(company_id, created_at DESC);

-- RLS
ALTER TABLE media_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "media_jobs_select"
  ON media_jobs FOR SELECT
  USING (company_id::text = auth.jwt() ->> 'company_id');

CREATE POLICY "media_jobs_insert"
  ON media_jobs FOR INSERT
  WITH CHECK (company_id::text = auth.jwt() ->> 'company_id');

-- Only the worker (service_role) can update jobs. Portal users cannot.
-- The worker uses service_role key which bypasses RLS.

-- ---------------------------------------------------------------------------
-- 4. Media Files (individual files within a job)
-- ---------------------------------------------------------------------------
CREATE TABLE media_files (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id                  UUID NOT NULL REFERENCES media_jobs(id) ON DELETE CASCADE,
  company_id              UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Source file info
  drive_file_id           TEXT NOT NULL,
  file_name               TEXT NOT NULL,
  file_mime_type          TEXT,
  file_size_bytes         BIGINT,
  file_checksum_sha256    TEXT,                   -- for idempotency detection

  -- Status
  status                  media_file_status NOT NULL DEFAULT 'pending',
  error_message           TEXT,
  retry_count             INT DEFAULT 0,

  -- Transcription results
  transcript_text         TEXT,                   -- full transcript
  transcript_segments     JSONB,                  -- [{id, start, end, text, speaker}]
  transcript_duration_sec NUMERIC(10,2),
  whisper_cost_usd        NUMERIC(8,4),

  -- Processing timestamps
  download_started_at     TIMESTAMPTZ,
  download_completed_at   TIMESTAMPTZ,
  transcription_started_at TIMESTAMPTZ,
  transcription_completed_at TIMESTAMPTZ,
  extraction_started_at   TIMESTAMPTZ,
  extraction_completed_at TIMESTAMPTZ,
  clipping_started_at     TIMESTAMPTZ,
  clipping_completed_at   TIMESTAMPTZ,

  -- Idempotency: same drive_file_id + checksum = already processed
  processed_at            TIMESTAMPTZ,

  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT uq_file_per_job UNIQUE (job_id, drive_file_id)
);

CREATE INDEX idx_files_job ON media_files(job_id);
CREATE INDEX idx_files_company ON media_files(company_id);
CREATE INDEX idx_files_drive ON media_files(drive_file_id);
CREATE INDEX idx_files_checksum ON media_files(file_checksum_sha256) WHERE file_checksum_sha256 IS NOT NULL;

-- RLS
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "media_files_select"
  ON media_files FOR SELECT
  USING (company_id::text = auth.jwt() ->> 'company_id');

-- ---------------------------------------------------------------------------
-- 5. Media Quotes (extracted quotes with metadata)
-- ---------------------------------------------------------------------------
CREATE TABLE media_quotes (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id                 UUID NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,
  job_id                  UUID NOT NULL REFERENCES media_jobs(id) ON DELETE CASCADE,
  company_id              UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Quote content
  quote_text              TEXT NOT NULL,
  speaker_name            TEXT,
  start_time_sec          NUMERIC(10,2) NOT NULL,
  end_time_sec            NUMERIC(10,2) NOT NULL,
  start_formatted         TEXT NOT NULL,           -- "MM:SS"
  end_formatted           TEXT NOT NULL,

  -- AI analysis
  score                   NUMERIC(3,1) NOT NULL CHECK (score BETWEEN 1 AND 10),
  category                TEXT NOT NULL,            -- results, satisfaction, endorsement, etc.
  reason                  TEXT,                     -- why Claude selected this quote

  -- Ordering
  rank_in_file            INT NOT NULL DEFAULT 0,

  -- Claude cost
  claude_cost_usd         NUMERIC(8,4),

  created_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quotes_file ON media_quotes(file_id);
CREATE INDEX idx_quotes_job ON media_quotes(job_id);
CREATE INDEX idx_quotes_company ON media_quotes(company_id);
CREATE INDEX idx_quotes_score ON media_quotes(company_id, score DESC);
CREATE INDEX idx_quotes_text_search ON media_quotes USING gin(quote_text gin_trgm_ops);

-- RLS
ALTER TABLE media_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "media_quotes_select"
  ON media_quotes FOR SELECT
  USING (company_id::text = auth.jwt() ->> 'company_id');

-- ---------------------------------------------------------------------------
-- 6. Media Clips (generated video/audio clips)
-- ---------------------------------------------------------------------------
CREATE TABLE media_clips (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id                UUID NOT NULL REFERENCES media_quotes(id) ON DELETE CASCADE,
  file_id                 UUID NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,
  job_id                  UUID NOT NULL REFERENCES media_jobs(id) ON DELETE CASCADE,
  company_id              UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Clip info
  clip_type               media_clip_type NOT NULL,   -- 'video' or 'audio'
  storage_path            TEXT NOT NULL,               -- path in Supabase Storage
  file_name               TEXT NOT NULL,
  file_size_bytes         BIGINT,
  duration_seconds        NUMERIC(10,2) NOT NULL,
  mime_type               TEXT NOT NULL,

  -- Timestamps used for the cut (including padding)
  cut_start_sec           NUMERIC(10,2) NOT NULL,
  cut_end_sec             NUMERIC(10,2) NOT NULL,

  created_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clips_quote ON media_clips(quote_id);
CREATE INDEX idx_clips_file ON media_clips(file_id);
CREATE INDEX idx_clips_job ON media_clips(job_id);
CREATE INDEX idx_clips_company ON media_clips(company_id);

-- RLS
ALTER TABLE media_clips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "media_clips_select"
  ON media_clips FOR SELECT
  USING (company_id::text = auth.jwt() ->> 'company_id');

-- ---------------------------------------------------------------------------
-- 7. Audit Logs
-- ---------------------------------------------------------------------------
CREATE TABLE media_audit_logs (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id              UUID NOT NULL,
  user_id                 UUID,
  job_id                  UUID,
  file_id                 UUID,
  clip_id                 UUID,

  action                  audit_action NOT NULL,
  details                 JSONB,                     -- structured context (no PII)

  ip_address              INET,
  user_agent              TEXT,

  created_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_company ON media_audit_logs(company_id, created_at DESC);
CREATE INDEX idx_audit_job ON media_audit_logs(job_id) WHERE job_id IS NOT NULL;
CREATE INDEX idx_audit_action ON media_audit_logs(action, created_at DESC);

-- RLS: audit logs visible to company admins only
ALTER TABLE media_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "media_audit_logs_select"
  ON media_audit_logs FOR SELECT
  USING (company_id::text = auth.jwt() ->> 'company_id');

-- No insert policy for users — only worker (service_role) writes audit logs.

-- ---------------------------------------------------------------------------
-- 8. Helper function: updated_at trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_media_jobs_updated
  BEFORE UPDATE ON media_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_media_files_updated
  BEFORE UPDATE ON media_files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_drive_connections_updated
  BEFORE UPDATE ON company_drive_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ---------------------------------------------------------------------------
-- 9. Supabase Storage bucket
-- ---------------------------------------------------------------------------
-- Run this in Supabase dashboard or via supabase CLI:
--
--   INSERT INTO storage.buckets (id, name, public)
--   VALUES ('media-clips', 'media-clips', false);
--
-- Storage RLS policy (only company's own clips):
--
--   CREATE POLICY "media_clips_storage_select"
--     ON storage.objects FOR SELECT
--     USING (
--       bucket_id = 'media-clips'
--       AND (storage.foldername(name))[1] = auth.jwt() ->> 'company_id'
--     );
--
-- (Worker uploads via service_role, bypassing RLS)

-- ---------------------------------------------------------------------------
-- 10. Stale job cleanup function (called by pg_cron or worker)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION cleanup_stale_media_jobs()
RETURNS void AS $$
BEGIN
  UPDATE media_jobs
  SET
    status = 'failed',
    progress_message = 'Timed out — job was processing for over 2 hours',
    locked_by = NULL,
    locked_at = NULL,
    completed_at = NOW()
  WHERE
    status = 'processing'
    AND locked_at < NOW() - INTERVAL '2 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule with pg_cron (if available):
-- SELECT cron.schedule('cleanup-stale-media-jobs', '*/15 * * * *', 'SELECT cleanup_stale_media_jobs()');

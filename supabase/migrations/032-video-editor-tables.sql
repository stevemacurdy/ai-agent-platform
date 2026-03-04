-- =============================================================================
-- WoulfAI Migration 032: Video Editor — video_jobs + video_clips tables
-- Also renames videdit → video-editor in agent_registry
-- =============================================================================

-- 1. Video Jobs table
CREATE TABLE IF NOT EXISTS video_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID,
  user_id UUID,
  mode TEXT NOT NULL CHECK (mode IN ('quote','power','cleanup')),
  status TEXT NOT NULL DEFAULT 'transcribing' CHECK (status IN ('uploading','transcribing','processing','complete','failed')),
  source_url TEXT NOT NULL,
  source_filename TEXT,
  source_duration_seconds INTEGER,
  source_size_bytes BIGINT,
  -- Transcript
  transcript JSONB,
  -- Quote mode inputs
  quotes TEXT[] DEFAULT '{}',
  stitch BOOLEAN DEFAULT false,
  -- Power mode inputs
  clip_min_seconds INTEGER DEFAULT 5,
  clip_max_seconds INTEGER DEFAULT 30,
  clip_formats TEXT[] DEFAULT '{16:9}',
  burn_captions BOOLEAN DEFAULT true,
  max_clips INTEGER DEFAULT 5,
  -- Cleanup mode inputs
  cleanup_options JSONB DEFAULT '{"normalize_audio":true,"reduce_noise":true,"color_correct":true,"stabilize":false}',
  -- Results
  output_url TEXT,
  error TEXT,
  processing_seconds INTEGER,
  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_video_jobs_company ON video_jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_video_jobs_status ON video_jobs(status);
CREATE INDEX IF NOT EXISTS idx_video_jobs_created ON video_jobs(created_at DESC);

ALTER TABLE video_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "video_jobs_company_isolation" ON video_jobs FOR ALL
  USING (true);

-- 2. Video Clips table
CREATE TABLE IF NOT EXISTS video_clips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES video_jobs(id) ON DELETE CASCADE,
  clip_index INTEGER NOT NULL DEFAULT 0,
  start_seconds NUMERIC(10,2) NOT NULL DEFAULT 0,
  end_seconds NUMERIC(10,2) NOT NULL DEFAULT 0,
  duration_seconds NUMERIC(10,2) NOT NULL DEFAULT 0,
  matched_quote TEXT,
  transcript_segment TEXT,
  confidence NUMERIC(5,4),
  download_url TEXT,
  thumbnail_url TEXT,
  format TEXT DEFAULT '16:9',
  captions_burned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_video_clips_job ON video_clips(job_id);

ALTER TABLE video_clips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "video_clips_access" ON video_clips FOR ALL
  USING (true);

-- 3. Update agent_registry: videdit → video-editor
UPDATE agent_registry SET
  slug = 'video-editor',
  display_name = 'Video Editor',
  short_description = 'AI video editing: quote extraction, marketing clips, and cleanup',
  description = 'AI-powered video editing — extract quote clips, generate marketing power clips with captions, and professional video cleanup',
  icon = '🎬',
  status = 'live',
  component_path = 'agents/video-editor/console'
WHERE slug = 'videdit';

-- If videdit doesn't exist, insert video-editor fresh
INSERT INTO agent_registry (slug, display_name, short_description, description, icon, status, component_path, display_order)
VALUES (
  'video-editor',
  'Video Editor',
  'AI video editing: quote extraction, marketing clips, and cleanup',
  'AI-powered video editing — extract quote clips, generate marketing power clips with captions, and professional video cleanup',
  '🎬',
  'live',
  'agents/video-editor/console',
  23
) ON CONFLICT (slug) DO UPDATE SET
  status = 'live',
  component_path = 'agents/video-editor/console';

-- 4. Map to operations category
INSERT INTO agent_category_map (agent_id, category_id, is_primary)
SELECT a.id, c.id, true
FROM agent_registry a, agent_categories c
WHERE a.slug = 'video-editor' AND c.slug = 'operations'
ON CONFLICT DO NOTHING;

SELECT 'Migration 032 complete: video_jobs + video_clips tables created, video-editor agent live' AS status;

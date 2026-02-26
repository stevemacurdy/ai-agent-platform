-- =============================================================================
-- Agent #22: Additional SQL — RPC Functions
-- Run AFTER the main migration.
-- =============================================================================

-- Atomic job claiming with FOR UPDATE SKIP LOCKED
-- This prevents two workers from grabbing the same job.
CREATE OR REPLACE FUNCTION claim_media_job(p_worker_id TEXT, p_now TIMESTAMPTZ)
RETURNS SETOF media_jobs AS $$
BEGIN
  RETURN QUERY
  UPDATE media_jobs
  SET
    status = 'processing',
    locked_by = p_worker_id,
    locked_at = p_now,
    updated_at = p_now
  WHERE id = (
    SELECT id FROM media_jobs
    WHERE status = 'queued'
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  )
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to service_role only (worker)
REVOKE ALL ON FUNCTION claim_media_job FROM PUBLIC;
GRANT EXECUTE ON FUNCTION claim_media_job TO service_role;

/**
 * Agent #22: Videdit Agent — TypeScript Types
 *
 * These types mirror the Supabase schema.
 * Place in your existing app: src/types/media.ts
 */

export type MediaJobStatus =
  | "queued"
  | "processing"
  | "completed"
  | "partial"
  | "failed"
  | "cancelled";

export type MediaFileStatus =
  | "pending"
  | "downloading"
  | "transcribing"
  | "extracting_quotes"
  | "cutting_clips"
  | "uploading_clips"
  | "completed"
  | "failed";

export type ClipType = "video" | "audio";

export type AuditAction =
  | "job_created"
  | "job_started"
  | "job_completed"
  | "job_failed"
  | "file_accessed"
  | "file_transcribed"
  | "clip_generated"
  | "clip_downloaded"
  | "drive_connected"
  | "drive_disconnected";

// ---- Row Types ----

export interface MediaJob {
  id: string;
  company_id: string;
  created_by_user_id: string;
  status: MediaJobStatus;
  quote_criteria: string;
  max_quotes_per_file: number;
  clip_padding_seconds: number;
  context_notes: string | null;
  drive_folder_id: string | null;
  drive_file_ids: string[] | null;
  progress_pct: number;
  progress_message: string;
  total_files: number;
  completed_files: number;
  failed_files: number;
  estimated_cost_usd: number | null;
  actual_cost_usd: number | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  idempotency_key: string | null;
  // Joined data
  files?: MediaFile[];
}

export interface MediaFile {
  id: string;
  job_id: string;
  company_id: string;
  drive_file_id: string;
  file_name: string;
  file_mime_type: string | null;
  file_size_bytes: number | null;
  file_checksum_sha256: string | null;
  status: MediaFileStatus;
  error_message: string | null;
  retry_count: number;
  transcript_text: string | null;
  transcript_segments: TranscriptSegment[] | null;
  transcript_duration_sec: number | null;
  whisper_cost_usd: number | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  quotes?: MediaQuote[];
}

export interface TranscriptSegment {
  id: number;
  start: number;
  end: number;
  text: string;
  speaker?: string;
}

export interface MediaQuote {
  id: string;
  file_id: string;
  job_id: string;
  company_id: string;
  quote_text: string;
  speaker_name: string | null;
  start_time_sec: number;
  end_time_sec: number;
  start_formatted: string;
  end_formatted: string;
  score: number;
  category: string;
  reason: string | null;
  rank_in_file: number;
  created_at: string;
  // Joined data
  clips?: MediaClip[];
}

export interface MediaClip {
  id: string;
  quote_id: string;
  file_id: string;
  job_id: string;
  company_id: string;
  clip_type: ClipType;
  storage_path: string;
  file_name: string;
  file_size_bytes: number | null;
  duration_seconds: number;
  mime_type: string;
  cut_start_sec: number;
  cut_end_sec: number;
  created_at: string;
  // Runtime
  signed_url?: string;
}

export interface CompanyDriveConnection {
  id: string;
  company_id: string;
  connected_by_user_id: string;
  root_folder_id: string | null;
  root_folder_name: string | null;
  google_email: string | null;
  is_active: boolean;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

// ---- API Request Types ----

export interface CreateJobRequest {
  drive_folder_id?: string;
  drive_file_ids?: string[];
  quote_criteria?: string;
  max_quotes_per_file?: number;
  clip_padding_seconds?: number;
  context_notes?: string;
  idempotency_key?: string;
}

export interface ListJobsParams {
  status?: MediaJobStatus;
  page?: number;
  per_page?: number;
}

export interface RefineQuotesRequest {
  feedback: string;
  file_id: string;
}

// ---- API Response Types ----

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface JobDetailResponse extends MediaJob {
  files: (MediaFile & {
    quotes: (MediaQuote & {
      clips: MediaClip[];
    })[];
  })[];
}

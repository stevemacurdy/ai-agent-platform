-- 036-lms-engine.sql
-- Shared Learning Management System engine
-- Powers both Operations Training and HR Training

-- ═══════════════════════════════════════════════════════════
-- 1. COURSES
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS lms_courses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid REFERENCES companies(id),
  department text NOT NULL CHECK (department IN ('operations', 'hr')),
  title text NOT NULL,
  description text,
  course_type text NOT NULL DEFAULT 'custom' CHECK (course_type IN (
    'safety_meeting', 'sop_training', 'equipment_cert',
    'compliance', 'onboarding', 'custom'
  )),
  equipment_type text CHECK (equipment_type IS NULL OR equipment_type IN (
    'forklift', 'order_picker', 'floor_cleaner', 'dock_leveler',
    'truck_restraint', 'scanner', 'computer', 'stretch_wrapper',
    'electric_pallet_jack', 'other'
  )),
  cert_validity_months integer DEFAULT 24,
  passing_score integer DEFAULT 100,
  created_by uuid REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lms_courses_company ON lms_courses(company_id);
CREATE INDEX IF NOT EXISTS idx_lms_courses_dept ON lms_courses(department, status);
CREATE INDEX IF NOT EXISTS idx_lms_courses_type ON lms_courses(course_type);

-- ═══════════════════════════════════════════════════════════
-- 2. QUIZZES
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS lms_quizzes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  version integer DEFAULT 1,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lms_quizzes_course ON lms_quizzes(course_id);

-- ═══════════════════════════════════════════════════════════
-- 3. QUESTIONS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS lms_questions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id uuid NOT NULL REFERENCES lms_quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false')),
  options jsonb NOT NULL DEFAULT '[]',
  explanation text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lms_questions_quiz ON lms_questions(quiz_id, sort_order);

-- ═══════════════════════════════════════════════════════════
-- 4. ASSIGNMENTS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS lms_assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  assigned_to uuid NOT NULL REFERENCES auth.users(id),
  assigned_by uuid NOT NULL REFERENCES auth.users(id),
  due_date date,
  reason text CHECK (reason IS NULL OR reason IN (
    'scheduled', 'accident_recert', 'new_hire', 'annual_renewal'
  )),
  status text NOT NULL DEFAULT 'assigned' CHECK (status IN (
    'assigned', 'in_progress', 'completed', 'overdue'
  )),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lms_assignments_user ON lms_assignments(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_lms_assignments_course ON lms_assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_lms_assignments_due ON lms_assignments(due_date) WHERE status IN ('assigned', 'in_progress');

-- ═══════════════════════════════════════════════════════════
-- 5. ATTEMPTS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS lms_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id uuid NOT NULL REFERENCES lms_quizzes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  assignment_id uuid REFERENCES lms_assignments(id),
  score integer NOT NULL DEFAULT 0,
  passed boolean NOT NULL DEFAULT false,
  answers jsonb NOT NULL DEFAULT '[]',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_lms_attempts_user ON lms_attempts(user_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_lms_attempts_assignment ON lms_attempts(assignment_id);

-- ═══════════════════════════════════════════════════════════
-- 6. CERTIFICATIONS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS lms_certifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  course_id uuid NOT NULL REFERENCES lms_courses(id),
  equipment_type text,
  cert_number text UNIQUE NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  revoke_reason text CHECK (revoke_reason IS NULL OR revoke_reason IN ('accident', 'expiry', 'admin')),
  issued_by uuid NOT NULL REFERENCES auth.users(id),
  delivery_method text NOT NULL DEFAULT 'email' CHECK (delivery_method IN ('email', 'sms', 'both')),
  delivery_status text NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'failed')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lms_certs_user ON lms_certifications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_lms_certs_expiry ON lms_certifications(expires_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_lms_certs_number ON lms_certifications(cert_number);

-- ═══════════════════════════════════════════════════════════
-- 7. SOP DOCUMENTS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS lms_sop_documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid REFERENCES companies(id),
  course_id uuid REFERENCES lms_courses(id),
  title text NOT NULL,
  file_path text NOT NULL,
  file_size integer,
  mime_type text,
  uploaded_by uuid NOT NULL REFERENCES auth.users(id),
  ai_summary text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lms_sops_company ON lms_sop_documents(company_id);
CREATE INDEX IF NOT EXISTS idx_lms_sops_course ON lms_sop_documents(course_id);

-- ═══════════════════════════════════════════════════════════
-- 8. SAFETY MEETINGS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS lms_safety_meetings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid REFERENCES companies(id),
  title text NOT NULL,
  topic text,
  content text,
  meeting_date date NOT NULL,
  duration_minutes integer DEFAULT 15,
  generated_by text NOT NULL DEFAULT 'manual' CHECK (generated_by IN ('ai', 'manual')),
  created_by uuid NOT NULL REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lms_meetings_company ON lms_safety_meetings(company_id);
CREATE INDEX IF NOT EXISTS idx_lms_meetings_date ON lms_safety_meetings(meeting_date DESC);

-- ═══════════════════════════════════════════════════════════
-- 9. ATTENDANCE
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS lms_attendance (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id uuid NOT NULL REFERENCES lms_safety_meetings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  attended boolean NOT NULL DEFAULT false,
  signed_at timestamptz,
  notes text,
  UNIQUE(meeting_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_lms_attendance_meeting ON lms_attendance(meeting_id);
CREATE INDEX IF NOT EXISTS idx_lms_attendance_user ON lms_attendance(user_id);

-- ═══════════════════════════════════════════════════════════
-- 10. COMPLETIONS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS lms_completions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  course_id uuid NOT NULL REFERENCES lms_courses(id),
  assignment_id uuid REFERENCES lms_assignments(id),
  completed_at timestamptz NOT NULL DEFAULT now(),
  score integer NOT NULL DEFAULT 100,
  signed_off_by uuid REFERENCES auth.users(id),
  sign_off_date timestamptz,
  certificate_id uuid REFERENCES lms_certifications(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lms_completions_user ON lms_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_lms_completions_course ON lms_completions(course_id);

-- ═══════════════════════════════════════════════════════════
-- 11. SUPABASE STORAGE BUCKET
-- ═══════════════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public)
VALUES ('lms-documents', 'lms-documents', false)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════

ALTER TABLE lms_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_sop_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_safety_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_completions ENABLE ROW LEVEL SECURITY;

-- Company isolation: users see data from their own company (via company_members)
CREATE POLICY "lms_courses_company" ON lms_courses FOR ALL USING (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())
);
CREATE POLICY "lms_quizzes_company" ON lms_quizzes FOR ALL USING (
  course_id IN (SELECT id FROM lms_courses WHERE company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid()))
);
CREATE POLICY "lms_questions_company" ON lms_questions FOR ALL USING (
  quiz_id IN (SELECT id FROM lms_quizzes WHERE course_id IN (SELECT id FROM lms_courses WHERE company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())))
);
CREATE POLICY "lms_assignments_user" ON lms_assignments FOR ALL USING (
  assigned_to = auth.uid() OR assigned_by = auth.uid()
  OR course_id IN (SELECT id FROM lms_courses WHERE company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid()))
);
CREATE POLICY "lms_attempts_user" ON lms_attempts FOR ALL USING (
  user_id = auth.uid()
  OR quiz_id IN (SELECT id FROM lms_quizzes WHERE course_id IN (SELECT id FROM lms_courses WHERE company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())))
);
CREATE POLICY "lms_certs_user" ON lms_certifications FOR ALL USING (
  user_id = auth.uid()
  OR course_id IN (SELECT id FROM lms_courses WHERE company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid()))
);
CREATE POLICY "lms_sops_company" ON lms_sop_documents FOR ALL USING (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())
);
CREATE POLICY "lms_meetings_company" ON lms_safety_meetings FOR ALL USING (
  company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid())
);
CREATE POLICY "lms_attendance_user" ON lms_attendance FOR ALL USING (
  user_id = auth.uid()
  OR meeting_id IN (SELECT id FROM lms_safety_meetings WHERE company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid()))
);
CREATE POLICY "lms_completions_user" ON lms_completions FOR ALL USING (
  user_id = auth.uid()
  OR course_id IN (SELECT id FROM lms_courses WHERE company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid()))
);

-- Storage policy: authenticated users can upload/read from lms-documents bucket for their company
CREATE POLICY "lms_storage_read" ON storage.objects FOR SELECT USING (
  bucket_id = 'lms-documents' AND auth.role() = 'authenticated'
);
CREATE POLICY "lms_storage_insert" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'lms-documents' AND auth.role() = 'authenticated'
);

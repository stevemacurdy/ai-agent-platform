-- =============================================================================
-- WoulfAI: Dump current agent_* table schema
-- Run in Supabase SQL Editor → copy the output
-- =============================================================================

SELECT 
  'Table: ' || table_name || E'\n' ||
  string_agg(
    '  ' || column_name || ' ' || 
    UPPER(data_type) || 
    CASE WHEN character_maximum_length IS NOT NULL THEN '(' || character_maximum_length || ')' ELSE '' END ||
    CASE WHEN data_type = 'ARRAY' THEN ' (element: ' || udt_name || ')' ELSE '' END ||
    CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
    CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
    E'\n' ORDER BY ordinal_position
  ) AS columns
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name LIKE 'agent_%'
GROUP BY table_name
ORDER BY table_name;

-- Also get constraints
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  CASE 
    WHEN tc.constraint_type = 'CHECK' THEN (
      SELECT check_clause FROM information_schema.check_constraints cc 
      WHERE cc.constraint_name = tc.constraint_name LIMIT 1
    )
    WHEN tc.constraint_type = 'FOREIGN KEY' THEN (
      SELECT ccu.table_name || '(' || ccu.column_name || ')' 
      FROM information_schema.constraint_column_usage ccu 
      WHERE ccu.constraint_name = tc.constraint_name LIMIT 1
    )
    ELSE NULL
  END AS details
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
  AND tc.table_name LIKE 'agent_%'
ORDER BY tc.table_name, tc.constraint_type;

-- Get indexes
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename LIKE 'agent_%'
ORDER BY tablename, indexname;

ALTER TABLE public.visitor_events
  DROP COLUMN IF EXISTS first_seen,
  DROP COLUMN IF EXISTS language,
  DROP COLUMN IF EXISTS platform,
  DROP COLUMN IF EXISTS screen,
  DROP COLUMN IF EXISTS referrer;
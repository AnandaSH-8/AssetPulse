ALTER TABLE public.visitor_events
  ADD COLUMN IF NOT EXISTS is_bot boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS visitor_events_user_id_idx
  ON public.visitor_events (user_id);

CREATE INDEX IF NOT EXISTS visitor_events_ip_hash_idx
  ON public.visitor_events (ip_hash);
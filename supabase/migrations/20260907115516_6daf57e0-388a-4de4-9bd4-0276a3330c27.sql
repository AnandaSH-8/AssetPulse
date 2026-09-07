CREATE TABLE public.visitor_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id text NOT NULL UNIQUE,
  ip_hash text,
  ip_masked text,
  user_id uuid,
  email text,
  user_agent text,
  visit_count integer NOT NULL DEFAULT 1,
  first_seen timestamp with time zone NOT NULL DEFAULT now(),
  last_seen timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.visitor_events TO service_role;

ALTER TABLE public.visitor_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX visitor_events_last_seen_idx ON public.visitor_events (last_seen DESC);
CREATE INDEX visitor_events_visit_count_idx ON public.visitor_events (visit_count DESC);

CREATE TRIGGER update_visitor_events_updated_at
BEFORE UPDATE ON public.visitor_events
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
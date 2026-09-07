CREATE POLICY "No direct access to visitor events"
ON public.visitor_events
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);
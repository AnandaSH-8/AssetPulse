CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_name text;
  v_base text;
  v_username text;
  v_suffix int := 0;
BEGIN
  v_name := NULLIF(TRIM(COALESCE(
    NEW.raw_user_meta_data ->> 'name',
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'user_name',
    split_part(COALESCE(NEW.email, ''), '@', 1)
  )), '');
  IF v_name IS NULL THEN
    v_name := 'User';
  END IF;

  v_base := NULLIF(TRIM(COALESCE(
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'preferred_username',
    NEW.raw_user_meta_data ->> 'user_name',
    split_part(COALESCE(NEW.email, ''), '@', 1)
  )), '');
  IF v_base IS NULL THEN
    v_base := 'user';
  END IF;
  v_base := lower(regexp_replace(v_base, '[^a-zA-Z0-9._-]', '', 'g'));
  IF v_base = '' THEN
    v_base := 'user';
  END IF;

  v_username := v_base;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE lower(username) = v_username) LOOP
    v_suffix := v_suffix + 1;
    v_username := v_base || v_suffix::text;
  END LOOP;

  INSERT INTO public.profiles (user_id, name, username)
  VALUES (NEW.id, v_name, v_username)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block account creation because of profile bookkeeping.
  RETURN NEW;
END;
$function$;
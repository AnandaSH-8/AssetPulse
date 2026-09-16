import { supabase } from '@/integrations/supabase/client';

const DEVICE_KEY = 'assetpulse-device-id';
const SESSION_KEY = 'assetpulse-visit-tracked';

const readCookie = (name: string) => {
  try {
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${name}=([^;]*)`),
    );
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
};

const writeCookie = (name: string, value: string) => {
  try {
    // 2 years, so the same browser stays one visitor even if storage is cleared.
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=63072000; SameSite=Lax`;
  } catch {
    // ignore
  }
};

// A stable id per browser. Kept in localStorage AND a cookie so that clearing
// one of them does not create a duplicate "new visitor".
const getDeviceId = () => {
  const newId = () =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

  let stored: string | null = null;
  try {
    stored = localStorage.getItem(DEVICE_KEY);
  } catch {
    stored = null;
  }

  const cookie = readCookie(DEVICE_KEY);
  const id = stored || cookie || newId();

  try {
    if (stored !== id) localStorage.setItem(DEVICE_KEY, id);
  } catch {
    // ignore
  }
  if (cookie !== id) writeCookie(DEVICE_KEY, id);

  return id;
};

// Records one visit per browser session, plus one extra ping when the visitor
// signs in so the row gets linked to their account. Failures are silent:
// analytics must never break the app.
export const trackVisit = async () => {
  try {
    const { data } = await supabase.auth.getSession();
    const identity = data.session?.user?.id ?? 'anon';
    const marker = `${SESSION_KEY}:${identity}`;
    if (sessionStorage.getItem(marker)) return;

    const deviceId = getDeviceId();
    if (!deviceId) return;
    sessionStorage.setItem(marker, '1');

    let timezone: string | undefined;
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      timezone = undefined;
    }

    await supabase.functions.invoke('track-visit', {
      body: {
        device_id: deviceId,
        timezone,
        // Only counted as a fresh visit the first time in a session.
        count_visit: identity === 'anon' || !sessionStorage.getItem(`${SESSION_KEY}:anon`),
      },
    });
  } catch {
    // ignore
  }
};

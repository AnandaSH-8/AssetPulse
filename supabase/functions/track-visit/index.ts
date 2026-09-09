import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { SUPABASE_URL, PUBLISHABLE_KEY, SECRET_KEY } from '../_shared/keys.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

// Raw IPs are never stored: only a salted one-way hash (for de-duplication)
// and a masked form for display.
const hashIp = async (ip: string) => {
  const salt = Deno.env.get('AMOUNT_ENCRYPTION_KEY') || 'assetpulse-visitor-salt';
  const bytes = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

const maskIp = (ip: string) => {
  if (!ip) return '';
  if (ip.includes(':')) {
    const parts = ip.split(':').filter(Boolean);
    return `${parts.slice(0, 2).join(':')}:x:x`;
  }
  const parts = ip.split('.');
  if (parts.length !== 4) return 'unknown';
  return `${parts[0]}.${parts[1]}.x.x`;
};

const COUNTRY_NAMES = new Intl.DisplayNames(['en'], { type: 'region' });

const countryName = (code: string | null) => {
  if (!code || code.length !== 2) return null;
  try {
    return COUNTRY_NAMES.of(code.toUpperCase()) ?? null;
  } catch {
    return null;
  }
};

const isPrivateIp = (ip: string) =>
  !ip ||
  ip === '127.0.0.1' ||
  ip === '::1' ||
  ip.startsWith('10.') ||
  ip.startsWith('192.168.') ||
  /^172\.(1[6-9]|2\d|3[01])\./.test(ip);

// Best-effort location: prefer edge headers, fall back to a keyless lookup.
const resolveGeo = async (req: Request, ip: string) => {
  const header = (name: string) => {
    const value = req.headers.get(name);
    return value && value.trim() ? value.trim() : null;
  };

  let code = header('cf-ipcountry') || header('x-vercel-ip-country');
  let city = header('x-vercel-ip-city');
  let region = header('x-vercel-ip-country-region');

  if (!code && !isPrivateIp(ip)) {
    try {
      const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`);
      if (res.ok) {
        const geo = (await res.json()) as {
          success?: boolean;
          country_code?: string;
          city?: string;
          region?: string;
        };
        if (geo?.success !== false) {
          code = geo.country_code ?? null;
          city = city ?? geo.city ?? null;
          region = region ?? geo.region ?? null;
        }
      }
    } catch {
      // Location is optional.
    }
  }

  if (code === 'XX') code = null;

  return {
    country_code: code ? code.toUpperCase() : null,
    country: countryName(code),
    city: city ? decodeURIComponent(city).slice(0, 120) : null,
    region: region ? decodeURIComponent(region).slice(0, 120) : null,
  };
};

const deviceTypeFrom = (ua: string) => {
  if (/iPad|Tablet/i.test(ua)) return 'Tablet';
  if (/Mobi|Android|iPhone/i.test(ua)) return 'Mobile';
  if (!ua) return null;
  return 'Desktop';
};

const clean = (value: unknown, max = 120) =>
  typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : null;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let body: {
    device_id?: string;
    timezone?: string;
    language?: string;
    screen?: string;
    platform?: string;
    referrer?: string;
  } = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const deviceId = (body.device_id || '').trim();
  if (!/^[a-zA-Z0-9-]{8,64}$/.test(deviceId)) {
    return json({ error: 'Invalid device_id' }, 400);
  }

  const forwarded = req.headers.get('x-forwarded-for') || '';
  const ip = (forwarded.split(',')[0] || req.headers.get('cf-connecting-ip') || '').trim();
  const userAgent = (req.headers.get('user-agent') || '').slice(0, 300);

  // Attach the account when a valid session token is present.
  let userId: string | null = null;
  let email: string | null = null;
  const authHeader = req.headers.get('Authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    try {
      const userClient = createClient(SUPABASE_URL, PUBLISHABLE_KEY, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data } = await userClient.auth.getUser(
        authHeader.replace('Bearer ', ''),
      );
      if (data?.user) {
        userId = data.user.id;
        email = data.user.email ?? null;
      }
    } catch {
      // Anonymous visit — keep going.
    }
  }

  const admin = createClient(SUPABASE_URL, SECRET_KEY);

  const { data: existing } = await admin
    .from('visitor_events')
    .select('id, visit_count')
    .eq('device_id', deviceId)
    .maybeSingle();

  const geo = await resolveGeo(req, ip);

  const payload: Record<string, unknown> = {
    ip_hash: ip ? await hashIp(ip) : null,
    ip_masked: ip ? maskIp(ip) : null,
    user_agent: userAgent,
    last_seen: new Date().toISOString(),
    timezone: clean(body.timezone, 60),
    language: clean(body.language, 20),
    screen: clean(body.screen, 20),
    platform: clean(body.platform, 60),
    referrer: clean(body.referrer, 300),
    device_type: deviceTypeFrom(userAgent),
    ...geo,
  };
  if (userId) {
    payload.user_id = userId;
    payload.email = email;
  }

  if (existing) {
    const { error } = await admin
      .from('visitor_events')
      .update({ ...payload, visit_count: (existing.visit_count ?? 0) + 1 })
      .eq('id', existing.id);
    if (error) return json({ error: error.message }, 500);
  } else {
    const { error } = await admin
      .from('visitor_events')
      .insert({ ...payload, device_id: deviceId, visit_count: 1 });
    if (error) return json({ error: error.message }, 500);
  }

  return json({ ok: true });
});


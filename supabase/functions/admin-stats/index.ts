import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { SUPABASE_URL, PUBLISHABLE_KEY, SECRET_KEY } from '../_shared/keys.ts';
import { CREATOR_EMAIL } from '../_shared/config.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');

  const userClient = createClient(SUPABASE_URL, PUBLISHABLE_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser(token);
  if (userErr || !userData.user) return json({ error: 'Unauthorized' }, 401);

  const callerEmail = (userData.user.email || '').toLowerCase();
  if (!CREATOR_EMAIL || callerEmail !== CREATOR_EMAIL) {
    return json({ error: 'Forbidden' }, 403);
  }

  const admin = createClient(SUPABASE_URL, SECRET_KEY);

  // Visitors
  const { data: visitors, error: visitorErr } = await admin
    .from('visitor_events')
    .select('device_id, ip_masked, email, user_id, user_agent, visit_count, first_seen, last_seen')
    .order('visit_count', { ascending: false })
    .order('last_seen', { ascending: false })
    .limit(1000);
  if (visitorErr) return json({ error: visitorErr.message }, 500);

  const all = visitors ?? [];
  const registered = all.filter((v) => !!v.user_id).length;
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const activeLast7Days = all.filter(
    (v) => v.last_seen && new Date(v.last_seen).getTime() >= sevenDaysAgo,
  ).length;
  const totalVisits = all.reduce((sum, v) => sum + (v.visit_count || 0), 0);

  // Accounts
  const { data: authUsers, error: authErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (authErr) return json({ error: authErr.message }, 500);

  const users = (authUsers?.users ?? []).slice().sort(
    (a, b) =>
      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(),
  );

  const { data: profiles } = await admin.from('profiles').select('user_id, username, name');
  const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));

  const accounts = users.map((u) => ({
    id: u.id,
    email: u.email ?? null,
    username: profileMap.get(u.id)?.username ?? null,
    name: profileMap.get(u.id)?.name ?? null,
    provider: (u.app_metadata as { provider?: string } | null)?.provider ?? 'email',
    confirmed: !!u.email_confirmed_at,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at ?? null,
  }));

  return json({
    summary: {
      total_visitors: all.length,
      total_visits: totalVisits,
      registered_visitors: registered,
      anonymous_visitors: all.length - registered,
      active_last_7_days: activeLast7Days,
      total_accounts: accounts.length,
    },
    top_visitors: all.slice(0, 10),
    remaining_visitors: Math.max(all.length - 10, 0),
    remaining_visitors_registered: Math.max(
      all.slice(10).filter((v) => !!v.user_id).length,
      0,
    ),
    top_accounts: accounts.slice(0, 10),
    remaining_accounts: Math.max(accounts.length - 10, 0),
  });
});

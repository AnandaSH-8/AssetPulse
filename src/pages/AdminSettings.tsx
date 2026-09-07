import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  UserPlus,
  Eye,
  Activity,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminSettings } from '@/lib/demo-user';
import { SEO } from '@/components/SEO';

type Visitor = {
  device_id: string;
  ip_masked: string | null;
  email: string | null;
  user_id: string | null;
  user_agent: string | null;
  visit_count: number;
  first_seen: string;
  last_seen: string;
};

type Account = {
  id: string;
  email: string | null;
  username: string | null;
  name: string | null;
  provider: string;
  confirmed: boolean;
  created_at: string;
  last_sign_in_at: string | null;
};

type Stats = {
  summary: {
    total_visitors: number;
    total_visits: number;
    registered_visitors: number;
    anonymous_visitors: number;
    active_last_7_days: number;
    total_accounts: number;
  };
  top_visitors: Visitor[];
  remaining_visitors: number;
  remaining_visitors_registered: number;
  top_accounts: Account[];
  remaining_accounts: number;
};

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

const describeDevice = (ua?: string | null) => {
  if (!ua) return 'Unknown device';
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /Chrome\//.test(ua)
      ? 'Chrome'
      : /Safari\//.test(ua) && !/Chrome/.test(ua)
        ? 'Safari'
        : /Firefox\//.test(ua)
          ? 'Firefox'
          : 'Other browser';
  const os = /Android/.test(ua)
    ? 'Android'
    : /iPhone|iPad|iOS/.test(ua)
      ? 'iOS'
      : /Windows/.test(ua)
        ? 'Windows'
        : /Mac OS X/.test(ua)
          ? 'macOS'
          : /Linux/.test(ua)
            ? 'Linux'
            : 'Unknown OS';
  return `${browser} · ${os}`;
};

const SummaryCard = ({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users;
  label: string;
  value: number | string;
  hint?: string;
}) => (
  <GlassCard className="p-5">
    <div className="flex items-center gap-3 mb-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
    <p className="text-2xl font-bold">{value}</p>
    {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
  </GlassCard>
);

export default function AdminSettings() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const adminSettings = useAdminSettings();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  const load = async (refresh = false) => {
    refresh ? setIsRefreshing(true) : setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-stats', {
        method: 'GET',
      });
      if (error || !data) throw new Error('Unable to load admin data');
      if ((data as { error?: string }).error) {
        setForbidden(true);
        return;
      }
      setStats(data as Stats);
      setForbidden(false);
    } catch {
      setForbidden(true);
      toast({
        title: 'Could not load admin data',
        description: 'This page is only available to the creator account.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    );
  }

  if (forbidden || adminSettings?.is_creator === false) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <GlassCard className="p-8 text-center space-y-4">
          <ShieldCheck className="h-10 w-10 mx-auto text-primary" />
          <h1 className="text-xl font-semibold">Admin Settings unavailable</h1>
          <p className="text-sm text-muted-foreground">
            This area is reserved for the creator account.
          </p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </GlassCard>
      </div>
    );
  }

  const s = stats?.summary;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto w-full">
      <SEO
        title="Admin Settings | AssetPulse"
        description="Creator-only overview of visitors and registered accounts."
        noindex
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-primary" />
            Admin Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visitors and accounts across AssetPulse. Anonymous visitors are estimated
            from their network address and browser, so shared networks may group people
            together.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => load(true)}
          disabled={isRefreshing}
          className="gap-2"
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={Users}
          label="Total visitors"
          value={s?.total_visitors ?? 0}
          hint={`${s?.total_visits ?? 0} visits recorded`}
        />
        <SummaryCard
          icon={UserPlus}
          label="Accounts created"
          value={s?.total_accounts ?? 0}
        />
        <SummaryCard
          icon={Eye}
          label="Visitors without account"
          value={s?.anonymous_visitors ?? 0}
        />
        <SummaryCard
          icon={Activity}
          label="Active last 7 days"
          value={s?.active_last_7_days ?? 0}
        />
      </div>

      <GlassCard className="p-4 md:p-6">
        <h2 className="text-lg font-semibold mb-4">Top 10 visitors</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border/60">
                <th className="py-2 pr-4 font-medium">#</th>
                <th className="py-2 pr-4 font-medium">Identity</th>
                <th className="py-2 pr-4 font-medium">Account</th>
                <th className="py-2 pr-4 font-medium text-right">Visits</th>
                <th className="py-2 pr-4 font-medium">Device</th>
                <th className="py-2 pr-4 font-medium">First seen</th>
                <th className="py-2 font-medium">Last seen</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.top_visitors ?? []).map((v, i) => (
                <tr key={v.device_id} className="border-b border-border/40">
                  <td className="py-2 pr-4 text-muted-foreground">{i + 1}</td>
                  <td className="py-2 pr-4 font-medium">
                    {v.email ?? (
                      <span>
                        {v.ip_masked ?? 'unknown IP'}
                        <span className="text-muted-foreground text-xs">
                          {' '}
                          · {v.device_id.slice(0, 8)}
                        </span>
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    {v.user_id ? (
                      <Badge className="bg-primary/15 text-primary hover:bg-primary/15">
                        Registered
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Visitor</Badge>
                    )}
                  </td>
                  <td className="py-2 pr-4 text-right tabular-nums">{v.visit_count}</td>
                  <td className="py-2 pr-4 text-muted-foreground">
                    {describeDevice(v.user_agent)}
                  </td>
                  <td className="py-2 pr-4 text-muted-foreground whitespace-nowrap">
                    {formatDate(v.first_seen)}
                  </td>
                  <td className="py-2 text-muted-foreground whitespace-nowrap">
                    {formatDate(v.last_seen)}
                  </td>
                </tr>
              ))}
              {(stats?.top_visitors ?? []).length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-muted-foreground">
                    No visits recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {!!stats?.remaining_visitors && (
          <p className="text-sm text-muted-foreground mt-4">
            + {stats.remaining_visitors} more visitors (
            {stats.remaining_visitors_registered} with an account,{' '}
            {stats.remaining_visitors - stats.remaining_visitors_registered} without)
          </p>
        )}
      </GlassCard>

      <GlassCard className="p-4 md:p-6">
        <h2 className="text-lg font-semibold mb-4">Top 10 newest accounts</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border/60">
                <th className="py-2 pr-4 font-medium">#</th>
                <th className="py-2 pr-4 font-medium">Email</th>
                <th className="py-2 pr-4 font-medium">Username</th>
                <th className="py-2 pr-4 font-medium">Sign-in method</th>
                <th className="py-2 pr-4 font-medium">Created</th>
                <th className="py-2 font-medium">Last sign in</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.top_accounts ?? []).map((a, i) => (
                <tr key={a.id} className="border-b border-border/40">
                  <td className="py-2 pr-4 text-muted-foreground">{i + 1}</td>
                  <td className="py-2 pr-4 font-medium">{a.email ?? '—'}</td>
                  <td className="py-2 pr-4">{a.username ?? a.name ?? '—'}</td>
                  <td className="py-2 pr-4 capitalize text-muted-foreground">
                    {a.provider}
                  </td>
                  <td className="py-2 pr-4 text-muted-foreground whitespace-nowrap">
                    {formatDate(a.created_at)}
                  </td>
                  <td className="py-2 text-muted-foreground whitespace-nowrap">
                    {formatDate(a.last_sign_in_at)}
                  </td>
                </tr>
              ))}
              {(stats?.top_accounts ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted-foreground">
                    No accounts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {!!stats?.remaining_accounts && (
          <p className="text-sm text-muted-foreground mt-4">
            + {stats.remaining_accounts} more accounts
          </p>
        )}
      </GlassCard>
    </div>
  );
}

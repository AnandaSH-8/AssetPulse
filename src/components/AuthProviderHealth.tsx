import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, ExternalLink, Clock, KeyRound } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';

type CheckStatus = 'ok' | 'warn';

interface HealthCheck {
  id: string;
  title: string;
  icon: typeof KeyRound;
  status: CheckStatus;
  recommendation: string;
  explanation: string;
  fixLabel: string;
  fixHref: string;
}

// These reflect the current known Supabase Auth configuration surfaced by the
// security scanner. They are informational — Supabase Auth settings can only
// be changed from the Supabase dashboard, not from the app.
const PROJECT_REF = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const AUTH_PROVIDERS_URL = `https://supabase.com/dashboard/project/${PROJECT_REF}/auth/providers`;

const checks: HealthCheck[] = [
  {
    id: 'leaked-password',
    title: 'Leaked password protection',
    icon: KeyRound,
    status: 'warn',
    recommendation: 'Recommended: ON',
    explanation:
      'Blocks users from choosing passwords that appear in known breach corpora (HaveIBeenPwned). Currently disabled for this project, so weak/breached passwords can still be accepted at signup.',
    fixLabel: 'Enable in Supabase',
    fixHref: AUTH_PROVIDERS_URL,
  },
  {
    id: 'otp-expiry',
    title: 'OTP expiry window',
    icon: Clock,
    status: 'warn',
    recommendation: 'Recommended: ≤ 3600 seconds (1 hour)',
    explanation:
      'One-time passwords for email/magic-link flows currently expire later than the recommended threshold. A shorter window reduces the blast radius if an OTP email is intercepted or forwarded.',
    fixLabel: 'Shorten in Supabase',
    fixHref: AUTH_PROVIDERS_URL,
  },
];

export function AuthProviderHealth() {
  const allOk = checks.every((c) => c.status === 'ok');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.36 }}
    >
      <GlassCard className="p-6 border-primary/30">
        <div className="flex items-center gap-3 mb-2">
          {allOk ? (
            <ShieldCheck className="h-6 w-6 text-emerald-500" />
          ) : (
            <ShieldAlert className="h-6 w-6 text-amber-500" />
          )}
          <h2 className="text-xl font-semibold">Auth Provider Health</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Status of recommended Supabase Auth hardening settings. These are
          managed in the Supabase dashboard — this widget explains what each
          check means and how to bring it into compliance.
        </p>

        <div className="space-y-3">
          {checks.map((check) => {
            const Icon = check.icon;
            const isOk = check.status === 'ok';
            return (
              <div
                key={check.id}
                className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 p-4 rounded-lg border border-border/50 bg-background/50"
              >
                <div className="flex gap-3 pr-4">
                  <div
                    className={`shrink-0 h-9 w-9 rounded-lg flex items-center justify-center ${
                      isOk
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-amber-500/10 text-amber-500'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{check.title}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          isOk
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {isOk ? 'Meets recommendation' : 'Action recommended'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {check.recommendation}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {check.explanation}
                    </p>
                  </div>
                </div>
                {!isOk && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="shrink-0 md:self-center"
                  >
                    <a
                      href={check.fixHref}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {check.fixLabel}
                      <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                    </a>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </GlassCard>
    </motion.div>
  );
}

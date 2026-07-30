import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import { ArrowLeft, KeyRound, Mail, MailCheck, TrendingUp } from 'lucide-react';

const ConfirmSignup = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState(params.get('email') ?? '');
  const [token, setToken] = useState(params.get('token') ?? '');
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to sign in shortly after a successful confirmation.
  useEffect(() => {
    if (!confirmed) return;
    const id = setTimeout(() => navigate('/auth?mode=signin', { replace: true }), 2000);
    return () => clearTimeout(id);
  }, [confirmed, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    const cleanToken = token.trim();

    if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setError('Enter the email address you signed up with.');
      return;
    }
    if (!cleanToken) {
      setError('Enter the confirmation code from your email.');
      return;
    }

    setLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'email',
      });
      if (verifyError) throw verifyError;

      // Confirmation only — the user signs in explicitly on the next screen.
      await supabase.auth.signOut({ scope: 'local' }).catch(() => {});

      setConfirmed(true);
      toast({
        title: 'Email confirmed',
        description: 'Your account is verified. Redirecting you to sign in…',
      });
    } catch (err: any) {
      const message = err?.message ?? 'Could not confirm your email.';
      setError(message);
      toast({
        variant: 'destructive',
        title: 'Confirmation failed',
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50 to-emerald-100 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950 px-4 py-12">
      <SEO
        title="Confirm your email | AssetPulse"
        description="Confirm your AssetPulse account by entering the verification code sent to your email."
        noindex
      />

      <div className="w-full max-w-md">
        <Link
          to="/auth?mode=signin"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald-600 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>

        <div className="rounded-2xl border border-emerald-500/20 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl shadow-xl shadow-emerald-500/10 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold">AssetPulse</span>
          </div>

          {confirmed ? (
            <div className="text-center space-y-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <MailCheck className="h-6 w-6 text-emerald-600" />
              </div>
              <h1 className="text-xl font-semibold">Email confirmed</h1>
              <p className="text-sm text-muted-foreground">
                Your account is verified. Taking you to the sign in page…
              </p>
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={() => navigate('/auth?mode=signin', { replace: true })}
              >
                Go to sign in
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold mb-1">Confirm your email</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Enter your email and the verification code we sent you to activate your
                account.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="confirm-email" className="text-sm font-medium">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      id="confirm-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full h-11 pl-10 pr-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="confirm-token" className="text-sm font-medium">
                    Confirmation code
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      id="confirm-token"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="123456"
                      className="w-full h-11 pl-10 pr-3 rounded-lg border border-input bg-background text-sm tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-destructive" role="alert">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700"
                >
                  {loading ? 'Confirming…' : 'Confirm email address'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmSignup;

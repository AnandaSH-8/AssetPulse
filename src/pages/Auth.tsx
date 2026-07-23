import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PasswordStrengthMeter } from '@/components/ui/password-strength-meter';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DEMO_EMAIL, DEMO_PASSWORD } from '@/lib/demo-user';
import {
  Mail,
  Lock,
  LogIn,
  UserPlus,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  MailCheck,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';


const safeNext = (raw: string | null): string => {
  if (!raw) return '/dashboard';
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/dashboard';
  return raw;
};

const Auth = () => {
  const [params, setParams] = useSearchParams();
  const initialSignUp = params.get('mode') === 'signup';
  const [isSignUp, setIsSignUp] = useState(initialSignUp);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(initialSignUp ? '' : DEMO_EMAIL);
  const [password, setPassword] = useState(initialSignUp ? '' : DEMO_PASSWORD);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [signupSuccessEmail, setSignupSuccessEmail] = useState<string | null>(null);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();
  const nextPath = safeNext(params.get('next'));
  const { toast } = useToast();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  const setMode = (signUp: boolean) => {
    setIsSignUp(signUp);
    const next = params.get('next');
    const search = new URLSearchParams();
    search.set('mode', signUp ? 'signup' : 'signin');
    if (next) search.set('next', next);
    setParams(search, { replace: true });
  };

  const handleResendConfirmation = async (targetEmail: string) => {
    if (resendCooldown > 0 || resendLoading) return;
    try {
      setResendLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: targetEmail,
        options: { emailRedirectTo: `${window.location.origin}${nextPath}` },
      });
      if (error) throw error;
      toast({
        title: 'Verification email sent',
        description: `We resent the link to ${targetEmail}.`,
      });
      setResendCooldown(30);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Could not resend email',
        description: error.message,
      });
    } finally {
      setResendLoading(false);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        navigate(nextPath);
      }
    };
    checkUser();
  }, [navigate, nextPath]);

  const validatePassword = (pwd: string) => {
    const checks = {
      length: pwd.length >= 12,
      lowercase: /[a-z]/.test(pwd),
      uppercase: /[A-Z]/.test(pwd),
      numbers: /\d/.test(pwd),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
    };
    return Object.values(checks).every((check) => check);
  };

  const validateUsername = (username: string) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    const noConsecutiveUnderscores = !/__/.test(username);
    const noStartEndUnderscore =
      !username.startsWith('_') && !username.endsWith('_');
    return (
      usernameRegex.test(username) &&
      noConsecutiveUnderscores &&
      noStartEndUnderscore
    );
  };

  const sanitizeInput = (input: string) => input.replace(/[<>"']/g, '');

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (
      !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
        email,
      )
    ) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (isSignUp && !validatePassword(password)) {
      newErrors.password = 'Password must meet all security requirements';
    } else if (!isSignUp && password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp) {
      if (!name) {
        newErrors.name = 'Name is required';
      } else if (name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      } else if (name.trim().length > 50) {
        newErrors.name = 'Name must be less than 50 characters';
      }

      if (!username) {
        newErrors.username = 'Username is required';
      } else if (!validateUsername(username)) {
        newErrors.username =
          'Username must be 3-30 characters, letters, numbers, and underscores only';
      }

      if (!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${nextPath}`,
            data: {
              name: sanitizeInput(name.trim()),
              username: sanitizeInput(username.trim().toLowerCase()),
            },
          },
        });
        if (error) throw error;
        setSignupSuccessEmail(email);
        setUnconfirmedEmail(null);
        toast({
          title: 'Account created!',
          description:
            "We've sent a verification link to your email. Confirm it before signing in.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate(nextPath);
      }
    } catch (error: any) {
      const msg: string = error?.message ?? '';
      const isUnconfirmed =
        error?.code === 'email_not_confirmed' ||
        /email not confirmed/i.test(msg);
      if (!isSignUp && isUnconfirmed) {
        setUnconfirmedEmail(email);
        toast({
          variant: 'destructive',
          title: 'Email not verified',
          description:
            'Please check your inbox for the verification link before signing in.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: msg,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}${nextPath}` },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Google sign in failed',
        description: error?.message || 'Please try again.',
      });
      setLoading(false);
    }
  };

  const isDemoCreds = !isSignUp && email === DEMO_EMAIL && password === DEMO_PASSWORD;

  const inputCls =
    'w-full bg-muted/40 border border-border rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-4 focus:ring-ring/20 transition-all';

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-background selection:bg-primary/30 relative overflow-hidden p-6">
      <SEO
        title={isSignUp ? 'Create your AssetPulse account' : 'Sign in to AssetPulse'}
        description={
          isSignUp
            ? 'Create your free AssetPulse account to start tracking assets, investments, and monthly net-worth growth.'
            : 'Sign in to AssetPulse to view your portfolio dashboard, analytics, and asset comparisons.'
        }
        path="/auth"
      />

      {/* Ambient background glows */}
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-[440px]">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        {/* Brand header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_hsl(var(--primary)/0.4)] mb-4">
            <TrendingUp className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">AssetPulse</h1>
          <p className="text-muted-foreground text-sm mt-1">Your wealth, refined.</p>
        </div>

        {/* Auth card */}
        <div className="bg-card/60 backdrop-blur-2xl border border-border rounded-3xl p-8 shadow-2xl">
          {signupSuccessEmail ? (
            <div className="space-y-5 text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <MailCheck className="h-7 w-7 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">Check your inbox</h2>
                <p className="text-sm text-muted-foreground">
                  We sent a verification link to{' '}
                  <span className="font-medium text-foreground">{signupSuccessEmail}</span>. Click it to
                  activate your account, then come back to sign in.
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  type="button"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={resendLoading || resendCooldown > 0}
                  onClick={() => handleResendConfirmation(signupSuccessEmail)}
                >
                  {resendLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : resendCooldown > 0 ? (
                    `Resend in ${resendCooldown}s`
                  ) : (
                    'Resend verification email'
                  )}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setSignupSuccessEmail(null);
                    setMode(false);
                    setEmail(DEMO_EMAIL);
                    setPassword(DEMO_PASSWORD);
                    setConfirmPassword('');
                    setErrors({});
                  }}
                  className="text-sm text-primary hover:text-primary/80"
                >
                  Back to sign in
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Tab toggle */}
              <div className="flex p-1 bg-muted rounded-xl mb-8">
                <button
                  type="button"
                  onClick={() => {
                    if (isSignUp) {
                      setMode(false);
                      setEmail(DEMO_EMAIL);
                      setPassword(DEMO_PASSWORD);
                      setConfirmPassword('');
                      setErrors({});
                    }
                  }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    !isSignUp
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!isSignUp) {
                      setMode(true);
                      setEmail('');
                      setPassword('');
                      setConfirmPassword('');
                      setErrors({});
                    }
                  }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    isSignUp
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-5">
                {isSignUp && (
                  <>
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1"
                      >
                        Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(sanitizeInput(e.target.value))}
                          placeholder="Enter your name"
                          className={inputCls}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-xs text-destructive ml-1">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="username"
                        className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1"
                      >
                        Username
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <input
                          id="username"
                          type="text"
                          value={username}
                          onChange={(e) =>
                            setUsername(sanitizeInput(e.target.value.toLowerCase()))
                          }
                          placeholder="Enter your username (min 3 characters)"
                          className={inputCls}
                        />
                      </div>
                      {errors.username && (
                        <p className="text-xs text-destructive ml-1">{errors.username}</p>
                      )}
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className={inputCls}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-destructive ml-1">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label
                      htmlFor="password"
                      className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      Password
                    </label>
                    {!isSignUp && !(email === DEMO_EMAIL && password === DEMO_PASSWORD) && (
                      <button
                        type="button"
                        onClick={() => {
                          setEmail(DEMO_EMAIL);
                          setPassword(DEMO_PASSWORD);
                        }}
                        className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        Use demo?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                      id="password"
                      type={!isDemoCreds && showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={
                        isSignUp
                          ? 'Enter a strong password (min 12 characters)'
                          : 'Enter your password'
                      }
                      className={`w-full bg-muted/40 border border-border rounded-xl pl-10 ${
                        isDemoCreds ? 'pr-4' : 'pr-10'
                      } py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-4 focus:ring-ring/20 transition-all`}
                    />
                    {!isDemoCreds && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive ml-1">{errors.password}</p>
                  )}
                  {isSignUp && <PasswordStrengthMeter password={password} />}
                </div>

                {isSignUp && (
                  <div className="space-y-2">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className={`w-full bg-muted/40 border border-border rounded-xl pl-10 pr-10 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-4 focus:ring-ring/20 transition-all`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-destructive ml-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                )}

                {!isSignUp && unconfirmedEmail && (
                  <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-left">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
                    <div className="flex-1 space-y-2">
                      <p className="text-sm text-amber-700 dark:text-amber-200">
                        Your email <span className="font-medium">{unconfirmedEmail}</span> isn't
                        verified yet.
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={resendLoading || resendCooldown > 0}
                        onClick={() => handleResendConfirmation(unconfirmedEmail)}
                      >
                        {resendLoading
                          ? 'Sending...'
                          : resendCooldown > 0
                          ? `Resend in ${resendCooldown}s`
                          : 'Resend verification email'}
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 h-auto rounded-xl shadow-[0_0_20px_hsl(var(--primary)/0.25)] transition-all transform hover:scale-[1.01] active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <>
                      {isSignUp ? (
                        <UserPlus className="h-4 w-4 mr-2" />
                      ) : (
                        <LogIn className="h-4 w-4 mr-2" />
                      )}
                      {isSignUp ? 'Create Account' : 'Sign In'}
                    </>
                  )}
                </Button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-4 text-muted-foreground tracking-widest font-medium">
                    Or continue with
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-muted/40 border border-border hover:bg-muted text-foreground py-2.5 rounded-xl transition-all disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.545 11.033v4.309h6.203c-.538 2.447-2.26 3.91-4.754 3.91-2.859 0-5.18-2.26-5.18-5.18s2.321-5.18 5.18-5.18c1.35 0 2.47.49 3.328 1.28l3.126-3.126C18.571 5.432 15.805 4.5 12.545 4.5 7.121 4.5 2.736 8.885 2.736 14.309s4.385 9.809 9.809 9.809c5.424 0 9.561-3.842 9.561-9.561 0-.61-.051-1.22-.153-1.805H12.545z" />
                </svg>
                <span className="text-sm font-medium">Google</span>
              </button>
            </>
          )}
        </div>

        <p className="text-center text-muted-foreground text-xs mt-8">
          By continuing, you agree to AssetPulse's{' '}
          <Link to="/" className="underline hover:text-primary transition-colors">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/" className="underline hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </main>
  );
};

export default Auth;

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { NeomorphInput } from '@/components/ui/neomorph-input';
import { PasswordStrengthMeter } from '@/components/ui/password-strength-meter';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Lock, LogIn, UserPlus, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';

const safeNext = (raw: string | null): string => {
  if (!raw) return '/dashboard';
  // Only allow same-origin relative paths.
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/dashboard';
  return raw;
};

const Auth = () => {
  const [params] = useSearchParams();
  const initialSignUp = params.get('mode') === 'signup';
  const [isSignUp, setIsSignUp] = useState(initialSignUp);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(initialSignUp ? '' : 'user@yopmail.com');
  const [password, setPassword] = useState(initialSignUp ? '' : 'userAssets@123');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();
  const nextPath = safeNext(params.get('next'));
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
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

    return Object.values(checks).every(check => check);
  };

  const validateUsername = (username: string) => {
    // Username: 3-30 chars, alphanumeric + underscore, no consecutive underscores
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

  const sanitizeInput = (input: string) => {
    // Remove potentially dangerous characters
    return input.replace(/[<>\"']/g, '');
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Email validation with more robust regex
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (
      !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
        email,
      )
    ) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (isSignUp && !validatePassword(password)) {
      newErrors.password = 'Password must meet all security requirements';
    } else if (!isSignUp && password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp) {
      // Name validation
      if (!name) {
        newErrors.name = 'Name is required';
      } else if (name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      } else if (name.trim().length > 50) {
        newErrors.name = 'Name must be less than 50 characters';
      }

      // Username validation
      if (!username) {
        newErrors.username = 'Username is required';
      } else if (!validateUsername(username)) {
        newErrors.username =
          'Username must be 3-30 characters, letters, numbers, and underscores only';
      }

      // Confirm password validation
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

    if (!validateForm()) {
      return;
    }

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

        toast({
          title: 'Account created!',
          description: 'Please check your email to verify your account.',
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
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-slate-150 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <SEO
        title={isSignUp ? 'Create your AssetPulse account' : 'Sign in to AssetPulse'}
        description={
          isSignUp
            ? 'Create your free AssetPulse account to start tracking assets, investments, and monthly net-worth growth.'
            : 'Sign in to AssetPulse to view your portfolio dashboard, analytics, and asset comparisons.'
        }
        path="/auth"
      />
      <GlassCard
        className="w-full max-w-sm sm:max-w-md lg:max-w-lg p-6 sm:p-8 space-y-4 sm:space-y-6 relative"
        style={{
          boxShadow:
            '0 -10px 25px rgba(0,0,0,0.1), 0 10px 25px rgba(0,0,0,0.1), -10px 0 25px rgba(0,0,0,0.1), 10px 0 25px rgba(0,0,0,0.1)',
        }}
      >
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            AssetPulse — Your personal wealth tracker
          </h1>
          <p className="text-muted-foreground">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>
        </div>


        <form onSubmit={handleEmailAuth} className="space-y-4">
          {isSignUp && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <NeomorphInput
                    id="name"
                    type="text"
                    value={name}
                    onChange={e => setName(sanitizeInput(e.target.value))}
                    className="pl-10"
                    placeholder="Enter your name"
                    error={errors.name}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <NeomorphInput
                    id="username"
                    type="text"
                    value={username}
                    onChange={e =>
                      setUsername(sanitizeInput(e.target.value.toLowerCase()))
                    }
                    className="pl-10"
                    placeholder="Enter your username (min 3 characters)"
                    error={errors.username}
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <NeomorphInput
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="pl-10 border border-gray-300"
                placeholder="Enter your email"
                error={errors.email}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <NeomorphInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pl-10 pr-10 border border-gray-300"
                placeholder={
                  isSignUp
                    ? 'Enter a strong password (min 12 characters)'
                    : 'Enter your password'
                }
                error={errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {isSignUp && <PasswordStrengthMeter password={password} />}
          </div>

          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <NeomorphInput
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="Confirm your password"
                  error={errors.confirmPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            style={{ marginTop: '30px' }}
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

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              const next = !isSignUp;
              setIsSignUp(next);
              // Clear demo credentials when switching to sign up; restore them for sign in
              setEmail(next ? '' : 'user@yopmail.com');
              setPassword(next ? '' : 'userAssets@123');
              setConfirmPassword('');
              setErrors({});
            }}
            className="text-primary hover:underline"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </GlassCard>
    </main>
  )
};

export default Auth;

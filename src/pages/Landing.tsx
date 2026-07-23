import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IndianRupee,
  TrendingUp,
  ShieldCheck,
  BarChart3,
  Wallet,
  LineChart,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  PieChart,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';


const features = [
  {
    icon: Wallet,
    title: 'Track Everything',
    description:
      'Track all your investments and liquid assets in one place.',
  },
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    description:
      'Get insights with beautiful charts and performance analytics.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Private',
    description:
      'Your data is encrypted and 100% secure with us.',
  },
  {
    icon: LineChart,
    title: 'Easy to Use',
    description:
      'Simple, clean and intuitive interface for everyone.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <SEO
        title="AssetPulse — Track, analyze & grow your wealth"
        description="Personal wealth tracker with monthly snapshots, net-worth analytics, and category performance. Sign up free and take control of your portfolio."
        path="/"
      />
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-md">
        <div className="w-full px-6 lg:px-10 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-primary text-white shadow-lg">
              <IndianRupee className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
              AssetPulse
            </h1>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how" className="hover:text-foreground transition-colors">How It Works</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/auth?mode=signin">
              <Button size="sm" variant="outline">
                Sign In
              </Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button size="sm">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-16 sm:py-24 grid gap-12 lg:grid-cols-2 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="h-3.5 w-3.5" />
              Take Control of Your Wealth
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Track. Analyze.{' '}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Grow Your Assets.
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              AssetPulse helps you track investments, analyze performance, and
              grow your wealth with smart insights.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/auth?mode=signup">
                <Button size="lg" className="gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Premium dashboard product showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            aria-hidden="true"
            className="relative"
          >
            {/* Ambient glow */}
            <div className="absolute -inset-6 bg-gradient-to-tr from-emerald-400/20 via-primary/10 to-transparent blur-3xl rounded-[3rem] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.08),transparent_50%)] rounded-[3rem] pointer-events-none" />

            {/* Main portfolio card */}
            <GlassCard className="relative p-8 rounded-3xl shadow-2xl border border-white/40 dark:border-white/10 backdrop-blur-xl bg-white/60 dark:bg-white/5 space-y-8">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    Portfolio Value
                  </p>
                  <p className="text-4xl font-bold tracking-tight">
                    ₹24,80,000
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
                    <ArrowUpRight className="h-3 w-3" />
                    +18.42% this year
                  </div>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-gradient-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
                  <Wallet className="h-5 w-5" />
                </div>
              </div>

              {/* Smooth growth graph */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-medium">Growth</p>
                  <p className="text-xs text-muted-foreground">Last 8 months</p>
                </div>
                <div className="relative h-28">
                  <svg viewBox="0 0 320 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="lineGrad" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                        <stop offset="100%" stopColor="#34d399" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,75 C40,70 60,55 90,50 C120,45 140,60 170,48 C200,36 220,28 250,22 C280,16 300,14 320,10 L320,100 L0,100 Z"
                      fill="url(#areaGrad)"
                    />
                    <path
                      d="M0,75 C40,70 60,55 90,50 C120,45 140,60 170,48 C200,36 220,28 250,22 C280,16 300,14 320,10"
                      fill="none"
                      stroke="url(#lineGrad)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="320" cy="10" r="4" fill="hsl(var(--primary))" />
                    <circle cx="320" cy="10" r="8" fill="hsl(var(--primary))" fillOpacity="0.25" />
                  </svg>
                </div>
              </div>

              {/* Bottom row - allocation + performance */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="rounded-2xl bg-background/50 border border-border/40 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <PieChart className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground font-medium">Allocation</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-full shrink-0"
                      style={{
                        background:
                          'conic-gradient(hsl(var(--primary)) 0 62%, #34d399 62% 84%, #cbd5e1 84% 100%)',
                      }}
                    >
                      <div className="w-full h-full rounded-full flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-background" />
                      </div>
                    </div>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span className="text-muted-foreground">Equity 62%</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-muted-foreground">Liquid 22%</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        <span className="text-muted-foreground">Others 16%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-background/50 border border-border/40 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground font-medium">Performance</p>
                  </div>
                  <p className="text-2xl font-bold">₹3.86L</p>
                  <div className="flex items-end gap-1 h-8">
                    {[40, 55, 45, 70, 60, 82, 74, 92].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm bg-gradient-to-t from-primary/70 to-emerald-400"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Floating widget - Total Assets */}
            <motion.div
              initial={{ opacity: 0, x: -20, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="hidden sm:flex absolute -left-6 top-1/3 items-center gap-3 rounded-2xl bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-xl px-4 py-3"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Assets</p>
                <p className="text-sm font-bold">12 Accounts</p>
              </div>
            </motion.div>

            {/* Floating widget - Profit */}
            <motion.div
              initial={{ opacity: 0, x: 20, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="hidden sm:flex absolute -right-4 -bottom-4 items-center gap-3 rounded-2xl bg-gradient-primary text-white shadow-xl shadow-primary/30 px-4 py-3"
            >
              <TrendingUp className="h-5 w-5" />
              <div>
                <p className="text-[10px] uppercase tracking-wider opacity-80">Profit</p>
                <p className="text-sm font-bold">+24.8%</p>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border/50 bg-background/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <h3 className="text-3xl sm:text-4xl font-bold">Why choose AssetPulse?</h3>
            <p className="text-muted-foreground">
              Purpose-built tools to make personal wealth tracking effortless.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <GlassCard className="p-6 h-full">
                  <div className="w-11 h-11 rounded-xl bg-gradient-primary text-white flex items-center justify-center mb-4 shadow-lg">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-semibold mb-1">{f.title}</h4>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <h3 className="text-3xl sm:text-4xl font-bold">How it works</h3>
            <p className="text-muted-foreground">Three simple steps to clarity.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { n: '01', t: 'Create an account', d: 'Sign up in seconds with email and password.' },
              { n: '02', t: 'Add your assets', d: 'Log each account with cash, invested and current values.' },
              { n: '03', t: 'Watch it grow', d: 'See analytics, comparisons and month-over-month growth.' },
            ].map(s => (
              <GlassCard key={s.n} className="p-6">
                <p className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {s.n}
                </p>
                <h4 className="font-semibold mt-3">{s.t}</h4>
                <p className="text-sm text-muted-foreground mt-1">{s.d}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>
      </main>


      <Footer />
    </div>
  );
}

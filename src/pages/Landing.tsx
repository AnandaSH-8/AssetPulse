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
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import Footer from '@/components/Footer';

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
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
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

          {/* Illustrative preview — clearly a sample, no real user data */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            aria-hidden="true"
          >
            <GlassCard className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Sample preview</p>
                  <p className="text-sm font-semibold">Portfolio Overview</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <TrendingUp className="h-3 w-3" />
                  Demo
                </span>
              </div>

              {/* Donut placeholder */}
              <div className="flex items-center gap-6">
                <div
                  className="w-28 h-28 rounded-full"
                  style={{
                    background:
                      'conic-gradient(hsl(var(--primary)) 0 62%, #34d399 62% 84%, #94a3b8 84% 100%)',
                  }}
                >
                  <div className="w-full h-full rounded-full flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-background/90 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <span className="text-muted-foreground">Investments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-muted-foreground">Liquid Assets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <span className="text-muted-foreground">Others</span>
                  </div>
                </div>
              </div>

              {/* Growth trend */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">Growth Overview</p>
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <TrendingUp className="h-3 w-3" />
                    +18.4%
                  </span>
                </div>
                <div className="h-28 rounded-xl bg-background/50 border border-border/50 flex items-end gap-1.5 p-3">
                  {[35, 55, 42, 68, 60, 82, 74, 90].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-md bg-gradient-to-t from-primary to-emerald-400"
                        style={{ height: `${h}%` }}
                      />
                      <span className="text-[9px] text-muted-foreground">
                        {['J','F','M','A','M','J','J','A'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
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


      <Footer />
    </div>
  );
}

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IndianRupee,
  TrendingUp,
  ShieldCheck,
  BarChart3,
  Wallet,
  LineChart,
  LogIn,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import Footer from '@/components/Footer';

const features = [
  {
    icon: Wallet,
    title: 'Track Every Asset',
    description:
      'Log cash, investments, and current values across categories in one place.',
  },
  {
    icon: BarChart3,
    title: 'Rich Analytics',
    description:
      'Month-over-month growth, category breakdowns, and clear percentage insights.',
  },
  {
    icon: LineChart,
    title: 'Visual Comparisons',
    description:
      'Compare months side by side and spot trends with beautiful charts.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure by Default',
    description:
      'AES-GCM encrypted amounts, Supabase auth, and row-level security.',
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
            <div>
              <h1 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                AssetPulse
              </h1>
              <p className="text-[10px] text-muted-foreground -mt-0.5">
                Track. Analyze. Grow.
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#cta" className="hover:text-foreground transition-colors">Get started</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/auth">
              <Button size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                Sign in / Sign up
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
              <TrendingUp className="h-3.5 w-3.5" />
              Personal finance, reimagined
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Your net worth,{' '}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                clearly tracked
              </span>{' '}
              month after month.
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              AssetPulse helps you record assets, monitor growth, and understand
              exactly where your money is moving — with encrypted storage and a
              delightful glass-morphism UI.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/auth">
                <Button size="lg" className="gap-2">
                  Get started free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline">
                  Explore features
                </Button>
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <GlassCard className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Total Assets', value: '₹12,45,000', chip: '+8.2%' },
                  { label: 'Liquid', value: '₹3,20,500', chip: '+2.1%' },
                  { label: 'Investments', value: '₹9,24,500', chip: '+11.5%' },
                  { label: 'Monthly Growth', value: '₹74,900', chip: '+6.4%' },
                ].map(k => (
                  <div
                    key={k.label}
                    className="p-4 rounded-xl bg-background/60 border border-border/50"
                  >
                    <p className="text-xs text-muted-foreground">{k.label}</p>
                    <p className="text-xl font-bold mt-1">{k.value}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                      {k.chip} vs last month
                    </p>
                  </div>
                ))}
              </div>
              <div className="h-32 rounded-xl bg-gradient-to-tr from-primary/10 via-emerald-200/30 to-transparent border border-border/50 flex items-end gap-2 p-3">
                {[35, 55, 42, 68, 60, 82, 74, 90].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-md bg-gradient-primary/80"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border/50 bg-background/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <h3 className="text-3xl sm:text-4xl font-bold">Everything you need</h3>
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

      {/* CTA */}
      <section id="cta" className="border-t border-border/50">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <GlassCard className="p-10 text-center space-y-5">
            <h3 className="text-3xl sm:text-4xl font-bold">
              Ready to take control of your finances?
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Join AssetPulse and start tracking your wealth with clarity and confidence.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link to="/auth">
                <Button size="lg" className="gap-2">
                  Sign up now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign in
                </Button>
              </Link>
            </div>
          </GlassCard>
        </div>
      </section>

      <Footer />
    </div>
  );
}

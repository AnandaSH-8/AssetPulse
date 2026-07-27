import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IndianRupee,
  Wallet,
  BarChart3,
  TrendingUp,
  Settings as SettingsIcon,
  FileSpreadsheet,
  ShieldCheck,
  LayoutDashboard,
  UserPlus,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { ThemeToggle } from '@/components/ThemeToggle';

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'getting-started', label: 'Getting started' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'add-particulars', label: 'Add Particulars' },
  { id: 'bulk-template', label: 'Bulk template' },
  { id: 'analytics', label: 'View Analytics' },
  { id: 'comparison', label: 'Comparison' },
  { id: 'settings', label: 'Settings' },
  { id: 'security', label: 'Security & privacy' },
  { id: 'faq', label: 'FAQ' },
];

const categoryHelp = [
  { name: 'Bank Account', note: 'Cash-only — enter the balance in the Cash field.' },
  { name: 'Cash in Hand', note: 'Cash-only — physical cash you hold.' },
  { name: 'Gold', note: 'Enter Invested and Current value (market value of your holdings).' },
  { name: 'Mutual Fund', note: 'Enter Invested and Current value to track returns.' },
  { name: 'Stocks', note: 'Enter Invested and Current value to track returns.' },
  { name: 'Crypto Currency', note: 'Enter Invested and Current value to track returns.' },
  { name: 'Recurring Deposit', note: 'Enter Invested and Current (with interest).' },
  { name: 'Provident Fund', note: 'Enter Invested contributions and Current balance.' },
  { name: 'Other', note: 'Anything else you want to keep an eye on.' },
];

function Section({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.4 }}
      className="scroll-mt-24"
    >
      <GlassCard className="p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Icon className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <div className="space-y-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
          {children}
        </div>
      </GlassCard>
    </motion.section>
  );
}

export default function Docs() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <SEO
        title="AssetPulse Docs — How the wealth tracker works"
        description="Complete guide to AssetPulse: sign up, add monthly particulars, bulk-import via Excel template, read the dashboard, analytics and comparison screens."
        path="/docs"
      />

      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-md">
        <div className="w-full px-6 lg:px-10 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-primary text-white shadow-lg">
              <IndianRupee className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
              AssetPulse
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle className="mr-1" />
            <Link to="/">
              <Button size="sm" variant="outline">
                Home
              </Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="max-w-3xl space-y-4 mb-10">
            <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              <HelpCircle className="h-3.5 w-3.5" />
              Documentation
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Everything about{' '}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                AssetPulse
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              AssetPulse is a personal wealth tracker. You record a snapshot of every asset
              you own once a month, and the app turns those snapshots into net-worth totals,
              growth percentages and period comparisons.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
            {/* Side nav */}
            <nav
              aria-label="Documentation sections"
              className="hidden lg:block sticky top-24 self-start"
            >
              <ul className="space-y-1 text-sm">
                {sections.map(s => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="block px-3 py-2 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-foreground transition-colors"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="space-y-6">
              <Section id="overview" icon={LayoutDashboard} title="Overview">
                <p>
                  Every entry in AssetPulse is one asset for one month — a title (e.g. “HDFC
                  Savings”), a category, and its amounts. Because entries are stamped with a
                  month and year, the app can show you exactly how your wealth moved over time.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Cash</strong> — money sitting idle (bank, cash, gold value).</li>
                  <li><strong>Invested</strong> — the amount you put into an investment.</li>
                  <li><strong>Current</strong> — what that investment is worth today.</li>
                </ul>
                <p>
                  Net worth = Cash + Current value of all investments. Returns = Current −
                  Invested.
                </p>
              </Section>

              <Section id="getting-started" icon={UserPlus} title="Getting started">
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Create an account from the Sign Up page (email + password).</li>
                  <li>Confirm your email if verification is enabled, then sign in.</li>
                  <li>
                    Go to <strong>Add Particulars</strong> and record your assets for the
                    current month — one row per account.
                  </li>
                  <li>
                    Open <strong>Dashboard</strong> and <strong>View Analytics</strong> to see
                    totals, growth and charts.
                  </li>
                  <li>Repeat once a month. Two months of data unlocks comparisons.</li>
                </ol>
                <p className="text-xs">
                  A read-only demo account is available on the sign-in screen if you just want
                  to look around.
                </p>
              </Section>

              <Section id="dashboard" icon={LayoutDashboard} title="Dashboard">
                <p>
                  The dashboard summarises your latest month. Each card shows the amount as the
                  headline value with the percentage change below it, always to two decimals.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Total Net Worth</strong> — cash plus current value of investments.</li>
                  <li><strong>Liquid Assets</strong> — cash-only categories.</li>
                  <li><strong>Investments</strong> — invested amount and its current value.</li>
                  <li>
                    <strong>Monthly Growth</strong> — the rupee difference from the previous
                    month with the percentage underneath.
                  </li>
                </ul>
                <p>
                  Click any card to open a breakdown dialog showing the exact components and the
                  arithmetic used, so no number is a black box.
                </p>
              </Section>

              <Section id="add-particulars" icon={Wallet} title="Add Particulars">
                <p>
                  Add or edit one asset at a time. Pick a saved title or type a new one, choose a
                  category, then fill in the amounts. The Month and Year selectors decide which
                  snapshot the entry belongs to and default to the current month.
                </p>
                <div className="grid sm:grid-cols-2 gap-2 pt-2">
                  {categoryHelp.map(c => (
                    <div
                      key={c.name}
                      className="rounded-xl border border-border/60 bg-background/40 p-3"
                    >
                      <p className="font-medium text-foreground text-sm">{c.name}</p>
                      <p className="text-xs">{c.note}</p>
                    </div>
                  ))}
                </div>
                <p className="pt-2">
                  Cash-only categories hide the Invested field and mirror Cash into Current
                  automatically. Editing an existing row from Analytics opens this screen with
                  the values pre-filled.
                </p>
              </Section>

              <Section id="bulk-template" icon={FileSpreadsheet} title="Bulk entry via template">
                <p>
                  On the Add Particulars screen you can download an Excel template and upload it
                  back to create many entries at once.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Columns: <strong>Title, Category, Cash, Invested, Current, Month, Year</strong>.
                  </li>
                  <li>
                    Category, Month and Year come as dropdowns; Month and Year are pre-filled
                    with the current month and year.
                  </li>
                  <li>
                    Amount columns are pre-filled with 0 and only accept numbers — any text in
                    them is rejected on upload with the exact row numbers.
                  </li>
                  <li>
                    If you already have data, the Title column arrives pre-filled with your
                    existing titles so you only need to type the amounts.
                  </li>
                  <li>
                    Do not rename or reorder the header row — it is validated before importing.
                  </li>
                  <li>
                    After upload you get a review dialog listing valid and invalid rows before
                    anything is saved.
                  </li>
                </ul>
              </Section>

              <Section id="analytics" icon={BarChart3} title="View Analytics">
                <p>
                  Analytics opens on your latest recorded month. Use the month dropdown — built
                  from the months you actually entered (e.g. “Dec-2025”) — to switch snapshots.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Category-wise distribution and performance charts.</li>
                  <li>
                    Assets by title in a four-column table: Name, current month, previous month
                    and the difference.
                  </li>
                  <li>Click a row to jump to Add Particulars with that entry pre-filled.</li>
                  <li>Export your data for records, and delete entries you no longer need.</li>
                </ul>
              </Section>

              <Section id="comparison" icon={TrendingUp} title="Comparison">
                <p>
                  Pick any two recorded periods and AssetPulse computes the difference for you.
                  The two selectors are mutually exclusive — choosing a period in one removes it
                  from the other, and picking an already-selected period swaps them.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Summary cards for net worth, cash, investments and growth.</li>
                  <li>Bar and line charts of category totals across both periods.</li>
                  <li>A table with absolute differences, growth percentages and best performer.</li>
                </ul>
              </Section>

              <Section id="settings" icon={SettingsIcon} title="Settings">
                <p>
                  Manage your account from Settings: update your password (minimum 12 characters
                  with mixed case, a number and a symbol), switch between light and dark theme,
                  and manage your data.
                </p>
              </Section>

              <Section id="security" icon={ShieldCheck} title="Security & privacy">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Authentication is handled by Supabase Auth with email verification.</li>
                  <li>
                    Row Level Security means every query is scoped to your user id — you can only
                    ever read or write your own rows.
                  </li>
                  <li>
                    Monetary values are encrypted with AES-GCM before they are stored, and
                    decrypted only for you on read.
                  </li>
                  <li>The demo account is read-only so shared data can’t be changed.</li>
                </ul>
              </Section>

              <Section id="faq" icon={HelpCircle} title="FAQ">
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-foreground">
                      How often should I add entries?
                    </p>
                    <p>
                      Once a month is enough. AssetPulse is built around monthly snapshots, so a
                      single entry per asset per month keeps every chart accurate.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Can I edit a past month?</p>
                    <p>
                      Yes. Open View Analytics, switch to that month and click the row you want
                      to change.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Why is my Monthly Growth empty?
                    </p>
                    <p>
                      Growth needs two months of data. It appears as soon as you have a previous
                      month to compare against.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Which currency is used?</p>
                    <p>All amounts are shown in Indian Rupees (₹).</p>
                  </div>
                </div>
              </Section>

              <GlassCard className="p-6 sm:p-8 text-center space-y-4">
                <h2 className="text-2xl font-bold">Ready to track your wealth?</h2>
                <p className="text-muted-foreground">
                  Create an account and log your first month in under five minutes.
                </p>
                <Link to="/auth?mode=signup" className="inline-block">
                  <Button size="lg" className="gap-2">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

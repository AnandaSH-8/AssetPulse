import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IndianRupee,
  FileText,
  ArrowLeft,
  HeartHandshake,
  ShieldCheck,
  Lock,
  Scale,
  Server,
  Mail,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { SEO } from '@/SEO';

const sections = [
  {
    id: 'welcome',
    title: 'Welcome',
    icon: HeartHandshake,
  },
  {
    id: 'what-you-can-expect',
    title: 'What you can expect',
    icon: BookOpen,
  },
  {
    id: 'keeping-your-account-safe',
    title: 'Keeping your account safe',
    icon: Lock,
  },
  {
    id: 'fair-use',
    title: 'Fair use',
    icon: Scale,
  },
  {
    id: 'your-data',
    title: 'Your data',
    icon: ShieldCheck,
  },
  {
    id: 'service-availability',
    title: 'Service availability',
    icon: Server,
  },
  {
    id: 'liability',
    title: 'Liability',
    icon: FileText,
  },
  {
    id: 'updates',
    title: 'Updates',
    icon: RefreshCw,
  },
  {
    id: 'contact',
    title: 'Contact',
    icon: Mail,
  },
];

export default function TermsOfService() {
  const lastUpdated = 'August 2, 2026';
  const [activeSection, setActiveSection] = useState('welcome');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 font-body">
      <SEO
        title="Terms of Service — AssetPulse"
        description="AssetPulse terms of service, acceptable use, and user responsibilities."
        path="/terms"
      />

      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="absolute inset-0 bg-background/50 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/10 shadow-[0_8px_32px_-12px_hsl(var(--foreground)/0.25)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-white/5 to-transparent dark:from-white/10 dark:via-white/[0.02] pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent pointer-events-none" />
        <div className="relative w-full px-6 lg:px-10 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-primary text-white shadow-lg">
              <IndianRupee className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
              AssetPulse
            </h1>
          </Link>
          <Link to="/">
            <Button size="sm" variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row pt-24 pb-16 px-6 lg:px-10 gap-8 max-w-7xl mx-auto w-full">
        {/* Sidebar navigation */}
        <aside className="lg:w-64 lg:shrink-0">
          <div className="lg:sticky lg:top-28">
            <GlassCard className="p-4">
              <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                {sections.map(({ id, title, icon: Icon }) => {
                  const isActive = activeSection === id;
                  return (
                    <button
                      key={id}
                      onClick={() => scrollTo(id)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap lg:whitespace-normal text-left ${
                        isActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{title}</span>
                    </button>
                  );
                })}
              </nav>
            </GlassCard>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center lg:text-left mb-10"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 font-heading">
              Terms of Service
            </h2>
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </motion.div>

          <GlassCard className="p-6 sm:p-10 space-y-12 text-sm sm:text-base text-muted-foreground leading-relaxed">
            <p className="text-sm text-muted-foreground border-l-2 border-primary/30 pl-4 py-1 bg-primary/5 rounded-r-lg">
              This page is a friendly guide to how AssetPulse works and what we
              expect from each other. It is not legal advice, and if anything
              here feels unclear, please reach out.
            </p>

            <section id="welcome" className="scroll-mt-32">
              <h3 className="text-xl font-semibold text-foreground mb-3 font-heading">
                Welcome to AssetPulse
              </h3>
              <p>
                AssetPulse is a quiet little space for tracking your personal
                wealth. By signing up or using the app, you are agreeing to
                these simple ground rules. If something here does not feel right
                for you, no hard feelings — just stop using the service.
              </p>
            </section>

            <section id="what-you-can-expect" className="scroll-mt-32">
              <h3 className="text-xl font-semibold text-foreground mb-3 font-heading">
                What you can expect from us
              </h3>
              <p className="mb-3">
                We built AssetPulse to help you record monthly asset values,
                see how your wealth changes over time, and export your own
                data whenever you want.
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Your data is yours. We do not sell it or use it for ads.</li>
                <li>
                  We use encryption and access controls to keep your financial
                  information private.
                </li>
                <li>
                  Features may evolve as we improve the product, but we will not
                  remove access to your own data without notice.
                </li>
              </ul>
            </section>

            <section id="keeping-your-account-safe" className="scroll-mt-32">
              <h3 className="text-xl font-semibold text-foreground mb-3 font-heading">
                Keeping your account safe
              </h3>
              <p className="mb-3">
                Please choose a strong, unique password and keep it to
                yourself. You are responsible for anything that happens under
                your account. If you ever suspect someone else has access, change
                your password right away.
              </p>
              <p>
                A good password is long, random, and not reused anywhere else.
                A password manager can make this easy.
              </p>
            </section>

            <section id="fair-use" className="scroll-mt-32">
              <h3 className="text-xl font-semibold text-foreground mb-3 font-heading">
                Fair use
              </h3>
                <p className="mb-3">
                To keep AssetPulse safe and useful for everyone, please do not:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Use the app for anything illegal or harmful.</li>
                <li>Try to access another user&apos;s data.</li>
                <li>Upload malicious files, spam, or abusive content.</li>
                <li>Reverse-engineer, scrape, or overload the API or MCP endpoints.</li>
                <li>Interfere with the service for other users.</li>
              </ul>
            </section>

            <section id="your-data" className="scroll-mt-32">
              <h3 className="text-xl font-semibold text-foreground mb-3 font-heading">
                Your data belongs to you
              </h3>
              <p className="mb-3">
                Everything you enter into AssetPulse stays your property. We only
                store and process it so the app can show you charts, summaries,
                and exports.
              </p>
              <p>
                You can export or delete your data at any time from the
                Settings page. If you delete your account, your data is removed
                along with it.
              </p>
            </section>

            <section id="service-availability" className="scroll-mt-32">
              <h3 className="text-xl font-semibold text-foreground mb-3 font-heading">
                Service availability
              </h3>
              <p>
                We do our best to keep AssetPulse running smoothly, but
                maintenance, updates, or things outside our control can cause
                brief interruptions. We are not able to promise 100% uptime.
              </p>
            </section>

            <section id="liability" className="scroll-mt-32">
              <h3 className="text-xl font-semibold text-foreground mb-3 font-heading">
                A note on liability
              </h3>
              <p>
                AssetPulse is a personal information tool, not a financial
                advisor. The numbers and charts are based on what you enter, so
                please do not make major investment, tax, or life decisions
                based on the app alone. We are not responsible for any financial
                losses that come from using the information shown here.
              </p>
            </section>

            <section id="updates" className="scroll-mt-32">
              <h3 className="text-xl font-semibold text-foreground mb-3 font-heading">
                Updates to these terms
              </h3>
              <p>
                These terms may change as the product grows. If we make
                significant changes, we will update the date at the top of this
                page. Continuing to use AssetPulse after changes means you are
                comfortable with the updated terms.
              </p>
            </section>

            <section id="contact" className="scroll-mt-32">
              <h3 className="text-xl font-semibold text-foreground mb-3 font-heading">
                Questions? Say hello
              </h3>
              <p>
                If anything here is confusing or you just want to chat about the
                app, you can reach the creator at{' '}
                <a
                  href="https://ananda-s-holla.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:text-primary/80"
                >
                  ananda-s-holla.vercel.app
                </a>
                .
              </p>
            </section>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}

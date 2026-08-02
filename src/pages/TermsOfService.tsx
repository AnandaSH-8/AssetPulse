import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IndianRupee, FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { SEO } from '@/components/SEO';

export default function TermsOfService() {
  const lastUpdated = 'August 2, 2026';

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
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

      <main className="flex-1 flex flex-col pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Terms of Service
            </h2>
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </motion.div>

          <GlassCard className="p-6 sm:p-10 space-y-8 text-sm sm:text-base text-muted-foreground leading-relaxed">
            <p className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-3">
              This page is maintained by the AssetPulse team as a plain-language
              summary of the rules for using the service. It is not legal advice.
            </p>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                1. Acceptance of Terms
              </h3>
              <p>
                By creating an account or using AssetPulse, you agree to these
                Terms of Service and our Privacy Policy. If you do not agree,
                please do not use the service.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                2. Description of Service
              </h3>
              <p>
                AssetPulse is a personal wealth-tracking application. It lets
                authenticated users record monthly asset values, view analytics,
                compare periods, and export their own data. Features may change
                over time as the product evolves.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                3. Account Responsibilities
              </h3>
              <p>
                You are responsible for keeping your login credentials secure
                and for all activity that occurs under your account. Use a strong,
                unique password and do not share your credentials with others.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                4. Acceptable Use
              </h3>
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Use AssetPulse for unlawful purposes.</li>
                <li>Attempt to access data that does not belong to you.</li>
                <li>Upload malicious files, spam, or abusive content.</li>
                <li>Reverse-engineer, scrape, or abuse the API or MCP endpoints.</li>
                <li>Interfere with the availability of the service for others.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                5. Data Ownership
              </h3>
              <p>
                You retain ownership of the financial data you enter. AssetPulse
                stores and processes it only to provide the service. You can
                export or delete your data from the Settings page at any time.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                6. Service Availability
              </h3>
              <p>
                We aim to keep AssetPulse available, but we do not guarantee
                uptime. Maintenance, updates, or factors outside our control may
                cause temporary interruptions.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                7. Limitation of Liability
              </h3>
              <p>
                AssetPulse is provided for personal informational purposes. We are
                not financial advisors. We are not liable for investment
                decisions, tax outcomes, or financial losses based on information
                shown in the app.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                8. Changes to These Terms
              </h3>
              <p>
                We may update these terms from time to time. Continued use of the
                service after changes means you accept the revised terms.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                9. Contact
              </h3>
              <p>
                For questions about these terms, reach out via the creator page at{' '}
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

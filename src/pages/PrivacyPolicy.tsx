import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IndianRupee, Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { SEO } from '@/components/SEO';

export default function PrivacyPolicy() {
  const lastUpdated = 'August 2, 2026';

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <SEO
        title="Privacy Policy — AssetPulse"
        description="AssetPulse privacy policy: what data we collect, how we use it, and your rights."
        path="/privacy"
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
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Privacy Policy
            </h2>
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </motion.div>

          <GlassCard className="p-6 sm:p-10 space-y-8 text-sm sm:text-base text-muted-foreground leading-relaxed">
            <p className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-3">
              This page is maintained by the AssetPulse team to explain how the
              app handles your information. It describes current practices, not
              independent certification.
            </p>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                1. Information We Collect
              </h3>
              <p>
                When you sign up, we collect your email address and authentication
                details through Supabase Auth. When you use the app, you may
                enter asset names, values, categories, months, and years. We also
                collect basic error and usage data needed to keep the service
                running.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                2. How We Use Your Information
              </h3>
              <p>We use your data to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Provide the AssetPulse tracking and analytics features.</li>
                <li>Keep your account secure and authenticate you.</li>
                <li>Respond to support requests and fix issues.</li>
                <li>Improve the product based on usage patterns.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                3. Data Storage & Security
              </h3>
              <p>
                Your data is stored in a Supabase PostgreSQL database with
                Row-Level Security enabled, so each user can only access their own
                records. Monetary values are encrypted at rest using AES-GCM
                encryption. We do not sell your personal data or financial records.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Security is a shared responsibility: we apply reasonable
                protections in the application, but you are responsible for
                keeping your password and device secure.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                4. Cookies & Local Storage
              </h3>
              <p>
                AssetPulse uses browser local storage and cookies only for
                authentication, theme preference, and temporary form drafts. We do
                not use third-party advertising cookies.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                5. Third-Party Services
              </h3>
              <p>
                We rely on Supabase for authentication, database, and hosting.
                Their handling of your data is governed by their own privacy and
                security practices. We also use Vercel for hosting the frontend.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                6. Your Rights
              </h3>
              <p>
                You can view, export, edit, or delete your financial data at any
                time from the Settings page. You can also delete your account,
                which removes your profile and financial records from our database.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                7. Data Retention
              </h3>
              <p>
                We keep your data for as long as your account is active. If you
                delete your account or specific month data, those records are
                removed from our active database.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                8. Changes to This Policy
              </h3>
              <p>
                We may update this Privacy Policy as the app evolves. Significant
                changes will be reflected by the "last updated" date at the top
                of this page.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                9. Contact
              </h3>
              <p>
                For privacy-related questions, contact the team via{' '}
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

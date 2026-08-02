import { useState } from 'react';
import { FileText, Shield, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type LegalDoc = 'terms' | 'privacy';

interface LegalModalProps {
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
  initialDoc?: LegalDoc;
  children?: React.ReactNode;
}

const lastUpdated = 'August 2, 2026';

const termsSections = [
  {
    title: '1. Acceptance of Terms',
    content:
      'By creating an account or using AssetPulse, you agree to these Terms of Service and our Privacy Policy. If you do not agree, please do not use the service.',
  },
  {
    title: '2. Description of Service',
    content:
      'AssetPulse is a personal wealth-tracking application. It lets authenticated users record monthly asset values, view analytics, compare periods, and export their own data. Features may change over time as the product evolves.',
  },
  {
    title: '3. Account Responsibilities',
    content:
      'You are responsible for keeping your login credentials secure and for all activity that occurs under your account. Use a strong, unique password and do not share your credentials with others.',
  },
  {
    title: '4. Acceptable Use',
    content:
      'You agree not to use AssetPulse for unlawful purposes; attempt to access data that does not belong to you; upload malicious files, spam, or abusive content; reverse-engineer, scrape, or abuse the API or MCP endpoints; or interfere with the availability of the service for others.',
  },
  {
    title: '5. Data Ownership',
    content:
      'You retain ownership of the financial data you enter. AssetPulse stores and processes it only to provide the service. You can export or delete your data from the Settings page at any time.',
  },
  {
    title: '6. Service Availability',
    content:
      'We aim to keep AssetPulse available, but we do not guarantee uptime. Maintenance, updates, or factors outside our control may cause temporary interruptions.',
  },
  {
    title: '7. Limitation of Liability',
    content:
      'AssetPulse is provided for personal informational purposes. We are not financial advisors. We are not liable for investment decisions, tax outcomes, or financial losses based on information shown in the app.',
  },
  {
    title: '8. Changes to These Terms',
    content:
      'We may update these terms from time to time. Continued use of the service after changes means you accept the revised terms.',
  },
];

const privacySections = [
  {
    title: '1. Information We Collect',
    content:
      'When you sign up, we collect your email address and authentication details through Supabase Auth. When you use the app, you may enter asset names, values, categories, months, and years. We also collect basic error and usage data needed to keep the service running.',
  },
  {
    title: '2. How We Use Your Information',
    content:
      'We use your data to provide the AssetPulse tracking and analytics features, keep your account secure and authenticate you, respond to support requests and fix issues, and improve the product based on usage patterns.',
  },
  {
    title: '3. Data Storage & Security',
    content:
      'Your data is stored in a Supabase PostgreSQL database with Row-Level Security enabled, so each user can only access their own records. Monetary values are encrypted at rest using AES-GCM encryption. We do not sell your personal data or financial records.',
  },
  {
    title: '4. Cookies & Local Storage',
    content:
      'AssetPulse uses browser local storage and cookies only for authentication, theme preference, and temporary form drafts. We do not use third-party advertising cookies.',
  },
  {
    title: '5. Third-Party Services',
    content:
      'We rely on Supabase for authentication, database, and hosting. Their handling of your data is governed by their own privacy and security practices. We also use Vercel for hosting the frontend.',
  },
  {
    title: '6. Your Rights',
    content:
      'You can view, export, edit, or delete your financial data at any time from the Settings page. You can also delete your account, which removes your profile and financial records from our active database.',
  },
  {
    title: '7. Data Retention',
    content:
      'We keep your data for as long as your account is active. If you delete your account or specific month data, those records are removed from our active database.',
  },
  {
    title: '8. Changes to This Policy',
    content:
      'We may update this Privacy Policy as the app evolves. Significant changes will be reflected by the "last updated" date at the top of this overlay.',
  },
];

export function LegalModal({
  trigger,
  defaultOpen = false,
  initialDoc = 'terms',
  children,
}: LegalModalProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [doc, setDoc] = useState<LegalDoc>(initialDoc);

  const isTerms = doc === 'terms';
  const sections = isTerms ? termsSections : privacySections;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      ) : (
        children && <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      )}
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 gap-0 overflow-hidden border border-primary/15 bg-background/95 backdrop-blur-xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                {isTerms ? (
                  <FileText className="w-5 h-5" />
                ) : (
                  <Shield className="w-5 h-5" />
                )}
              </div>
              <DialogTitle className="text-xl font-bold text-foreground">
                {isTerms ? 'Terms of Service' : 'Privacy Policy'}
              </DialogTitle>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Last updated: {lastUpdated}
          </p>
        </DialogHeader>

        <div className="flex border-b border-border/60">
          <button
            type="button"
            onClick={() => setDoc('terms')}
            className={cn(
              'flex-1 py-3 text-sm font-medium transition-colors border-b-2',
              isTerms
                ? 'text-primary border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            )}
          >
            Terms of Service
          </button>
          <button
            type="button"
            onClick={() => setDoc('privacy')}
            className={cn(
              'flex-1 py-3 text-sm font-medium transition-colors border-b-2',
              !isTerms
                ? 'text-primary border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            )}
          >
            Privacy Policy
          </button>
        </div>

        <ScrollArea className="px-6 py-5 h-[55vh]">
          <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
            <p className="text-xs border-l-2 border-primary/30 pl-3">
              This page is maintained by the AssetPulse team to explain the rules
              and practices for using the service. It is not legal advice or an
              independent certification.
            </p>
            {sections.map((section) => (
              <section key={section.title}>
                <h4 className="text-base font-semibold text-foreground mb-1">
                  {section.title}
                </h4>
                <p>{section.content}</p>
              </section>
            ))}
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t border-border/60 flex justify-end">
          <Button size="sm" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function TermsTrigger({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 gap-0 overflow-hidden border border-primary/15 bg-background/95 backdrop-blur-xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <DialogTitle className="text-xl font-bold text-foreground">
                Terms of Service
              </DialogTitle>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Last updated: {lastUpdated}
          </p>
        </DialogHeader>
        <ScrollArea className="px-6 py-5 h-[55vh]">
          <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
            <p className="text-xs border-l-2 border-primary/30 pl-3">
              This page is maintained by the AssetPulse team to explain the rules
              for using the service. It is not legal advice.
            </p>
            {termsSections.map((section) => (
              <section key={section.title}>
                <h4 className="text-base font-semibold text-foreground mb-1">
                  {section.title}
                </h4>
                <p>{section.content}</p>
              </section>
            ))}
          </div>
        </ScrollArea>
        <div className="px-6 py-4 border-t border-border/60 flex justify-end">
          <Button size="sm" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PrivacyTrigger({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 gap-0 overflow-hidden border border-primary/15 bg-background/95 backdrop-blur-xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <DialogTitle className="text-xl font-bold text-foreground">
                Privacy Policy
              </DialogTitle>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Last updated: {lastUpdated}
          </p>
        </DialogHeader>
        <ScrollArea className="px-6 py-5 h-[55vh]">
          <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
            <p className="text-xs border-l-2 border-primary/30 pl-3">
              This page is maintained by the AssetPulse team to explain how the
              app handles your information. It describes current practices, not
              independent certification.
            </p>
            {privacySections.map((section) => (
              <section key={section.title}>
                <h4 className="text-base font-semibold text-foreground mb-1">
                  {section.title}
                </h4>
                <p>{section.content}</p>
              </section>
            ))}
          </div>
        </ScrollArea>
        <div className="px-6 py-4 border-t border-border/60 flex justify-end">
          <Button size="sm" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

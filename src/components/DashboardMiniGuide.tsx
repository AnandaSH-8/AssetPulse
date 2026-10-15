import { Link } from 'react-router-dom';
import { Plus, BarChart3, GitCompare, Info, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const ITEMS = [
  { icon: Plus, title: 'Add Particulars', to: '/add-particulars', body: 'Log each asset for a month — one by one or in bulk with the Excel template.' },
  { icon: BarChart3, title: 'View Analytics', to: '/statistics', body: 'See all entries by month, category breakdowns, edit entries and export to PDF.' },
  { icon: GitCompare, title: 'Comparison', to: '/comparison', body: 'Compare two months side by side to see what grew or shrank.' },
  { icon: Info, title: 'About Us', to: '/about', body: 'Read the full guide: how each number is calculated and how features work.' },
  { icon: Settings, title: 'Settings', to: '/settings', body: 'Manage your profile, preferences and delete a month of data if needed.' },
];

export function DashboardMiniGuide({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Welcome to AssetPulse 👋</DialogTitle>
          <DialogDescription>A quick look at where everything lives.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {ITEMS.map(({ icon: Icon, title, to, body }) => (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className="flex gap-3 rounded-xl p-3 hover:bg-primary/10 transition-colors"
            >
              <div className="h-9 w-9 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{title}</p>
                <p className="text-xs text-muted-foreground">{body}</p>
              </div>
            </Link>
          ))}
        </div>
        <Button onClick={onClose} className="w-full">Got it</Button>
      </DialogContent>
    </Dialog>
  );
}

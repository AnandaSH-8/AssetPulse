import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export interface TourStep {
  target: string; // value of data-tour attribute
  title: string;
  body: string;
}

interface Props {
  steps: TourStep[];
  open: boolean;
  onClose: () => void;
}

const PAD = 8;
const CARD_W = 320;

export function GuidedTour({ steps, open, onClose }: Props) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const step = steps[index];

  const measure = useCallback(() => {
    if (!step) return;
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    setRect(el ? el.getBoundingClientRect() : null);
  }, [step]);

  useEffect(() => {
    if (open) setIndex(0);
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !step) return;
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const t = window.setTimeout(measure, 350);
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [open, step, measure]);

  const next = useCallback(() => {
    if (index < steps.length - 1) setIndex(i => i + 1);
    else onClose();
  }, [index, steps.length, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') setIndex(i => Math.max(0, i - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, next, onClose]);

  if (!open || !step) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cardW = Math.min(CARD_W, vw - 24);
  let top = vh / 2 - 90;
  let left = vw / 2 - cardW / 2;
  if (rect) {
    const below = rect.bottom + PAD + 12;
    top = below + 200 < vh ? below : Math.max(12, rect.top - PAD - 12 - 200);
    left = Math.min(Math.max(12, rect.left), vw - cardW - 12);
  }

  return createPortal(
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label={step.title}>
      {rect ? (
        <div
          className="absolute rounded-xl ring-2 ring-primary transition-all duration-300 pointer-events-none"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow: '0 0 0 9999px hsl(var(--background) / 0.75)',
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-background/75" />
      )}
      <div
        className="absolute rounded-2xl border border-primary/30 bg-card text-card-foreground shadow-xl p-5 transition-all duration-300"
        style={{ top, left, width: cardW }}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-xs font-medium text-primary">
            Step {index + 1} of {steps.length}
          </span>
          <button onClick={onClose} aria-label="Close guide" className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{step.body}</p>
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">
            Skip tour
          </button>
          <div className="flex gap-2">
            {index > 0 && (
              <Button size="sm" variant="outline" onClick={() => setIndex(i => i - 1)}>
                Back
              </Button>
            )}
            <Button size="sm" onClick={next}>
              {index === steps.length - 1 ? 'Done' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** Auto-opens once per user per guide; returns [open, setOpen]. */
export function useFirstTimeGuide(key: string, userId: string | undefined) {
  const storageKey = `assetpulse:guide:${key}:${userId ?? 'guest'}`;
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!userId) return;
    let seen = false;
    try {
      seen = localStorage.getItem(storageKey) === '1';
    } catch {
      /* ignore */
    }
    if (seen) return;
    const t = window.setTimeout(() => setOpen(true), 700);
    return () => window.clearTimeout(t);
  }, [storageKey, userId]);
  const close = useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem(storageKey, '1');
    } catch {
      /* ignore */
    }
  }, [storageKey]);
  return { open, show: () => setOpen(true), close };
}

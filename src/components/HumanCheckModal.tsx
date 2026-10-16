import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShieldCheck, Check, Loader2 } from 'lucide-react';
import { checkHumanVerified, submitHumanVerified } from '@/lib/visitor';

const TRACK_W = 300;
const TOKEN = 56;
const SNAP = 18;

type Pt = { x: number; y: number; t: number };

// Measures how "human" a drag was: real hands wobble off a perfectly straight line.
const gestureStats = (pts: Pt[]) => {
  const duration = pts.length > 1 ? pts[pts.length - 1].t - pts[0].t : 0;
  const ys = pts.map((p) => p.y);
  const mean = ys.reduce((a, b) => a + b, 0) / (ys.length || 1);
  const jitter = Math.sqrt(ys.reduce((a, b) => a + (b - mean) ** 2, 0) / (ys.length || 1));
  return { duration: Math.round(duration), points: pts.length, jitter: Number(jitter.toFixed(2)) };
};

export function HumanCheckModal() {
  const [open, setOpen] = useState(false);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'checking' | 'done' | 'fail'>('idle');
  const start = useRef<{ px: number; py: number } | null>(null);
  const pts = useRef<Pt[]>([]);
  const target = TRACK_W - TOKEN;

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const solved = await checkHumanVerified();
      if (!cancelled && !solved) setOpen(true);
    }, 3000);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const onDown = (e: React.PointerEvent) => {
    if (status === 'checking' || status === 'done') return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    start.current = { px: e.clientX - x, py: e.clientY - y };
    pts.current = [{ x: e.clientX, y: e.clientY, t: performance.now() }];
    setDragging(true);
    setStatus('idle');
  };

  const onMove = (e: React.PointerEvent) => {
    if (!dragging || !start.current) return;
    const nx = Math.max(0, Math.min(target, e.clientX - start.current.px));
    const ny = Math.max(-20, Math.min(20, e.clientY - start.current.py));
    setX(nx);
    setY(ny);
    pts.current.push({ x: e.clientX, y: e.clientY, t: performance.now() });
  };

  const reset = () => {
    setX(0);
    setY(0);
  };

  const onUp = async () => {
    if (!dragging) return;
    setDragging(false);
    const inHole = Math.abs(x - target) <= SNAP && Math.abs(y) <= SNAP;
    if (!inHole) {
      reset();
      return;
    }
    setX(target);
    setY(0);
    const g = gestureStats(pts.current);
    if (g.duration < 250 || g.points < 6 || g.jitter <= 0) {
      setStatus('fail');
      window.setTimeout(reset, 400);
      return;
    }
    setStatus('checking');
    const ok = await submitHumanVerified(g);
    if (ok) {
      setStatus('done');
      window.setTimeout(() => setOpen(false), 900);
    } else {
      setStatus('fail');
      window.setTimeout(reset, 400);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 backdrop-blur-md p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="human-check-title"
        >
          <motion.div
            initial={{ scale: 0.92, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-sm rounded-2xl border border-primary/30 bg-card/90 p-6 text-center shadow-2xl backdrop-blur-xl"
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 id="human-check-title" className="text-lg font-semibold text-foreground">
              Quick human check
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Drag the green circle into the empty hole to continue.
            </p>

            <div
              className="relative mx-auto mt-6 h-[96px] select-none touch-none"
              style={{ width: TRACK_W }}
            >
              <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-muted" />
              {/* Hole */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 rounded-full border-2 border-dashed transition-colors ${
                  status === 'done'
                    ? 'border-primary bg-primary/20'
                    : 'border-primary/60 bg-muted/60 shadow-inner'
                }`}
                style={{ left: target, width: TOKEN, height: TOKEN }}
              />
              {/* Cover */}
              <div
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={onUp}
                aria-label="Drag this circle into the hole"
                className={`absolute top-1/2 flex cursor-grab items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg active:cursor-grabbing ${
                  dragging ? '' : 'transition-all duration-300'
                } ${status === 'fail' ? 'animate-pulse' : ''}`}
                style={{
                  width: TOKEN,
                  height: TOKEN,
                  transform: `translate(${x}px, calc(-50% + ${y}px))`,
                }}
              >
                {status === 'checking' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : status === 'done' ? (
                  <Check className="h-6 w-6" />
                ) : (
                  <span className="h-3 w-3 rounded-full bg-primary-foreground/80" />
                )}
              </div>
            </div>

            <p className="mt-2 h-5 text-xs text-muted-foreground">
              {status === 'done'
                ? 'Verified — welcome!'
                : status === 'fail'
                  ? 'That looked automated. Please try again slowly.'
                  : 'Asked only once per network.'}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default HumanCheckModal;

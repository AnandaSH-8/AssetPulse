import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShieldCheck, Check, Loader2 } from 'lucide-react';
import { checkHumanVerified, submitHumanVerified } from '@/lib/visitor';

const TRACK_W = 300;
const TOKEN = 56;
const SNAP = 18;
const AREA_H = 160;
const APEX = 80; // how high the peak rises above the baseline
const BASE_TOP = AREA_H - TOKEN - 4;
const TARGET = TRACK_W - TOKEN;
const MID = TARGET / 2;
// Inverted-V: rises from start to the apex at MID, then falls into the hole.
const pathY = (x: number) => -APEX * (1 - Math.abs(x - MID) / MID);

type Pt = { x: number; y: number; t: number };

// Measures how "human" a drag was: real hands wobble off a perfectly straight line.
const gestureStats = (pts: Pt[]) => {
  const duration = pts.length > 1 ? pts[pts.length - 1].t - pts[0].t : 0;
  // y holds the pointer's deviation from the V guide — real hands wobble.
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
  const target = TARGET;
  const peaked = useRef(false);

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
    pts.current = [{ x: e.clientX, y: 0, t: performance.now() }];
    peaked.current = false;
    setDragging(true);
    setStatus('idle');
  };

  const onMove = (e: React.PointerEvent) => {
    if (!dragging || !start.current) return;
    const nx = Math.max(0, Math.min(target, e.clientX - start.current.px));
    // Stop the circle from jumping far ahead in one move (no teleporting past the peak).
    const stepped = Math.min(nx, x + 40);
    const ideal = pathY(stepped);
    const rawY = e.clientY - start.current.py;
    const dev = rawY - ideal;
    // Pointer must stay near the slope; if it wanders off, the circle stops following.
    if (Math.abs(dev) > 45) return;
    if (Math.abs(stepped - MID) < 22 && Math.abs(dev) < 35) peaked.current = true;
    setX(stepped);
    setY(ideal);
    pts.current.push({ x: e.clientX, y: dev, t: performance.now() });
  };

  const reset = () => {
    setX(0);
    setY(0);
  };

  const onUp = async () => {
    if (!dragging) return;
    setDragging(false);
    const inHole = Math.abs(x - target) <= SNAP && peaked.current;
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
              Drag the green circle up over the peak and down into the hole.
            </p>

            <div
              className="relative mx-auto mt-6 select-none touch-none"
              style={{ width: TRACK_W, height: AREA_H }}
            >
              <svg className="pointer-events-none absolute inset-0" width={TRACK_W} height={AREA_H}>
                <polyline
                  points={`${TOKEN / 2},${BASE_TOP + TOKEN / 2} ${MID + TOKEN / 2},${BASE_TOP + TOKEN / 2 - APEX} ${TARGET + TOKEN / 2},${BASE_TOP + TOKEN / 2}`}
                  fill="none"
                  className="stroke-muted"
                  strokeWidth={6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points={`${TOKEN / 2},${BASE_TOP + TOKEN / 2} ${MID + TOKEN / 2},${BASE_TOP + TOKEN / 2 - APEX} ${TARGET + TOKEN / 2},${BASE_TOP + TOKEN / 2}`}
                  fill="none"
                  className="stroke-primary/50"
                  strokeWidth={2}
                  strokeDasharray="4 6"
                  strokeLinecap="round"
                />
              </svg>
              {/* Hole */}
              <div
                className={`absolute rounded-full border-2 border-dashed transition-colors ${
                  status === 'done'
                    ? 'border-primary bg-primary/20'
                    : 'border-primary/60 bg-muted/60 shadow-inner'
                }`}
                style={{ left: target, top: BASE_TOP, width: TOKEN, height: TOKEN }}
              />
              {/* Cover */}
              <div
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={onUp}
                aria-label="Drag this circle into the hole"
                className={`absolute left-0 flex cursor-grab items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg active:cursor-grabbing ${
                  dragging ? '' : 'transition-all duration-300'
                } ${status === 'fail' ? 'animate-pulse' : ''}`}
                style={{
                  width: TOKEN,
                  height: TOKEN,
                  top: BASE_TOP,
                  transform: `translate(${x}px, ${y}px)`,
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

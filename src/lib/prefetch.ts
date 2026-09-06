// Warm up route chunks so first navigation doesn't wait on a network fetch.
const loaders: Record<string, () => Promise<unknown>> = {
  '/dashboard': () => import('@/pages/Dashboard'),
  '/add-particulars': () => import('@/pages/AddParticulars'),
  '/statistics': () => import('@/pages/Statistics'),
  '/comparison': () => import('@/pages/Comparison'),
  '/settings': () => import('@/pages/Settings'),
  '/about': () => import('@/pages/Docs'),
  '/docs': () => import('@/pages/Docs'),
};

const done = new Set<string>();

export const prefetchRoute = (path: string) => {
  const load = loaders[path];
  if (!load || done.has(path)) return;
  done.add(path);
  void load().catch(() => done.delete(path));
};

export const prefetchAllRoutes = () => {
  const run = () => Object.keys(loaders).forEach(prefetchRoute);
  const idle = (window as unknown as {
    requestIdleCallback?: (cb: () => void) => void;
  }).requestIdleCallback;
  if (idle) idle(run);
  else window.setTimeout(run, 800);
};

import { Suspense, lazy } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { AppSidebar } from '@/components/AppSidebar';
import Footer from '@/components/Footer';
import Landing from './pages/Landing';
const Docs = lazy(() => import('./pages/Docs'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AddParticulars = lazy(() => import('./pages/AddParticulars'));
const Statistics = lazy(() => import('./pages/Statistics'));
const Comparison = lazy(() => import('./pages/Comparison'));
const Settings = lazy(() => import('./pages/Settings'));
import Auth from './pages/Auth';
const ConfirmSignup = lazy(() => import('./pages/ConfirmSignup'));
const OAuthConsent = lazy(() => import('./pages/OAuthConsent'));
const NotFound = lazy(() => import('./pages/NotFound'));

const queryClient = new QueryClient();

const HeaderTitle = () => {
  const { state, isMobile } = useSidebar();
  // Sidebar already shows the brand when expanded on desktop — avoid duplication.
  if (!isMobile && state === 'expanded') return null;
  return (
    <h1 className="text-lg font-semibold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
      AssetPulse
    </h1>
  );
};

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    const next = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/auth?mode=signin&next=${encodeURIComponent(next)}`}
        replace
      />
    );
  }

  return <>{children}</>;
};

const AppContent = () => {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/about" element={<Navigate to="/docs" replace />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
          <Route path="/confirm-signup" element={<ConfirmSignup />} />

          <Route
            path="/auth"
            element={user ? <Navigate to="/dashboard" replace /> : <Auth />}
          />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                  <AppSidebar />
                  <main className="flex-1 flex flex-col">
                    {/* Header with sidebar trigger - always visible */}
                    <header className="h-14 flex items-center justify-between border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 px-4 shadow-sm">
                      <div className="flex items-center">
                        <SidebarTrigger className="mr-4 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" />
                        <HeaderTitle />
                      </div>
                    </header>

                    {/* Main content */}
                    <div className="flex-1 flex flex-col overflow-auto">
                      <div className="flex-1">
                        <Routes>
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route
                            path="/add-particulars"
                            element={<AddParticulars />}
                          />
                          <Route path="/statistics" element={<Statistics />} />
                          <Route path="/comparison" element={<Comparison />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </div>
                      <Footer />
                    </div>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </SidebarProvider>
  )
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="asset-pulse-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
)

export default App;

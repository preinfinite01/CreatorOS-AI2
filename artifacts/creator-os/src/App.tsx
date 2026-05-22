import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, lazy, Suspense } from "react";
import { supabase } from "./lib/supabase";
import { useAuthStore } from "./store/authStore";
import { useUserStore } from "./store/userStore";
import { useSubscriptionStore } from "./store/subscriptionStore";
import { CountryDetector } from "@/components/CountryDetector";
import { GenerationAdModal } from "@/components/ads/GenerationAdModal";
import { Skeleton } from "@/components/ui/skeleton";

// Layouts
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

// Eagerly loaded (critical path)
import Landing from "@/pages/landing";
import Login from "@/pages/auth/login";
import Signup from "@/pages/auth/signup";
import VerifyEmail from "@/pages/auth/verify-email";
import NotFound from "@/pages/not-found";

// Lazily loaded (post-login routes)
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Tools = lazy(() => import("@/pages/tools"));
const Titles = lazy(() => import("@/pages/tools/titles"));
const Hooks = lazy(() => import("@/pages/tools/hooks"));
const Scripts = lazy(() => import("@/pages/tools/scripts"));
const Ideas = lazy(() => import("@/pages/tools/ideas"));
const Workflow = lazy(() => import("@/pages/tools/workflow"));
const Captions = lazy(() => import("@/pages/tools/captions"));
const Hashtags = lazy(() => import("@/pages/tools/hashtags"));
const ImageGen = lazy(() => import("@/pages/tools/image"));
const Repurpose = lazy(() => import("@/pages/tools/repurpose"));
const Thumbnail = lazy(() => import("@/pages/tools/thumbnail"));
const Description = lazy(() => import("@/pages/tools/description"));
const AdCopy = lazy(() => import("@/pages/tools/adcopy"));
const BrandVoice = lazy(() => import("@/pages/tools/brand-voice"));
const Projects = lazy(() => import("@/pages/projects"));
const Settings = lazy(() => import("@/pages/settings"));
const Onboarding = lazy(() => import("@/pages/onboarding"));
const Pricing = lazy(() => import("@/pages/pricing"));
const PaymentSuccess = lazy(() => import("@/pages/payment-success"));
const Terms = lazy(() => import("@/pages/legal/terms"));
const Privacy = lazy(() => import("@/pages/legal/privacy"));
const RefundPolicy = lazy(() => import("@/pages/legal/refund-policy"));
const AcceptableUse = lazy(() => import("@/pages/legal/acceptable-use"));
const Cookies = lazy(() => import("@/pages/legal/cookies"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function PageLoader() {
  return (
    <div className="flex-1 p-8 space-y-4 max-w-4xl">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-1/2" />
      <div className="grid grid-cols-3 gap-4 mt-6">
        {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Public */}
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/verify-email" component={VerifyEmail} />
        <Route path="/pricing"><Suspense fallback={<PageLoader />}><Pricing /></Suspense></Route>
        <Route path="/payment/success"><Suspense fallback={<PageLoader />}><PaymentSuccess /></Suspense></Route>
        <Route path="/terms"><Suspense fallback={<PageLoader />}><Terms /></Suspense></Route>
        <Route path="/privacy"><Suspense fallback={<PageLoader />}><Privacy /></Suspense></Route>
        <Route path="/refund-policy"><Suspense fallback={<PageLoader />}><RefundPolicy /></Suspense></Route>
        <Route path="/acceptable-use"><Suspense fallback={<PageLoader />}><AcceptableUse /></Suspense></Route>
        <Route path="/cookies"><Suspense fallback={<PageLoader />}><Cookies /></Suspense></Route>

        {/* Protected */}
        <Route path="/onboarding">
          <ProtectedRoute><Suspense fallback={<PageLoader />}><Onboarding /></Suspense></ProtectedRoute>
        </Route>
        <Route path="/dashboard">
          <ProtectedRoute><Suspense fallback={<PageLoader />}><Dashboard /></Suspense></ProtectedRoute>
        </Route>
        <Route path="/tools">
          <ProtectedRoute><Suspense fallback={<PageLoader />}><Tools /></Suspense></ProtectedRoute>
        </Route>

        {/* AI Tools — original */}
        <Route path="/tools/titles">
          <ProtectedRoute><Suspense fallback={<PageLoader />}><Titles /></Suspense></ProtectedRoute>
        </Route>
        <Route path="/tools/hooks">
          <ProtectedRoute><Suspense fallback={<PageLoader />}><Hooks /></Suspense></ProtectedRoute>
        </Route>
        <Route path="/tools/script">
          <ProtectedRoute><Suspense fallback={<PageLoader />}><Scripts /></Suspense></ProtectedRoute>
        </Route>
        <Route path="/tools/ideas">
          <ProtectedRoute><Suspense fallback={<PageLoader />}><Ideas /></Suspense></ProtectedRoute>
        </Route>
        <Route path="/tools/workflow">
          <ProtectedRoute><Suspense fallback={<PageLoader />}><Workflow /></Suspense></ProtectedRoute>
        </Route>

        {/* AI Tools — new */}
        <Route path="/tools/captions">
          <ProtectedRoute><Suspense fallback={<PageLoader />}><Captions /></Suspense></ProtectedRoute>
        </Route>
        <Route path="/tools/hashtags">
          <ProtectedRoute><Suspense fallback={<PageLoader />}><Hashtags /></Suspense></ProtectedRoute>
        </Route>
        <Route path="/tools/image">
          <ProtectedRoute><Suspense fallback={<PageLoader />}><ImageGen /></Suspense></ProtectedRoute>
        </Route>
        <Route path="/tools/repurpose">
          <ProtectedRoute><Suspense fallback={<PageLoader />}><Repurpose /></Suspense></ProtectedRoute>
        </Route>
        <Route path="/tools/thumbnail">
          <ProtectedRoute><Suspense fallback={<PageLoader />}><Thumbnail /></Suspense></ProtectedRoute>
        </Route>
        <Route path="/tools/description">
          <ProtectedRoute><Suspense fallback={<PageLoader />}><Description /></Suspense></ProtectedRoute>
        </Route>
        <Route path="/tools/adcopy">
          <ProtectedRoute><Suspense fallback={<PageLoader />}><AdCopy /></Suspense></ProtectedRoute>
        </Route>
        <Route path="/tools/brand-voice">
          <ProtectedRoute><Suspense fallback={<PageLoader />}><BrandVoice /></Suspense></ProtectedRoute>
        </Route>

        {/* Other Protected */}
        <Route path="/projects">
          <ProtectedRoute><Suspense fallback={<PageLoader />}><Projects /></Suspense></ProtectedRoute>
        </Route>
        <Route path="/settings">
          <ProtectedRoute><Suspense fallback={<PageLoader />}><Settings /></Suspense></ProtectedRoute>
        </Route>

        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  const { setSession, setUser } = useAuthStore();
  const { loadProfile } = useUserStore();
  const { loadSubscription, loadRates } = useSubscriptionStore();

  useEffect(() => {
    loadRates();
  }, [loadRates]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.id) {
        // Load profile from API (triggers daily credit refresh if due)
        loadProfile(session.user.id);
        loadSubscription(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.id) {
        loadProfile(session.user.id);
        loadSubscription(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, setUser, loadSubscription, loadProfile]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
          <CountryDetector />
          <GenerationAdModal />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

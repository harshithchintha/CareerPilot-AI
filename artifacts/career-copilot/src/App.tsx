import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from 'wouter';
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";

import { AppLayout } from "./components/AppLayout";
import LandingPage from "./pages/landing";
import DashboardPage from "./pages/dashboard";
import ResumesPage from "./pages/resumes";
import ResumeDetailPage from "./pages/resumes/detail";
import JobsPage from "./pages/jobs";
import JobDetailPage from "./pages/jobs/detail";
import InterviewsPage from "./pages/interviews";
import InterviewDetailPage from "./pages/interviews/detail";
import RoadmapsPage from "./pages/roadmaps";
import RoadmapDetailPage from "./pages/roadmaps/detail";
import CoverLettersPage from "./pages/cover-letters";
import ChatPage from "./pages/chat";
import ProfilePage from "./pages/profile";
import ProjectsPage from "./pages/projects";
import QuestionsPage from "./pages/questions";

const rawClerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = !!rawClerkKey;

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  rawClerkKey || "pk_test_bGl2ZS1tb2NrbW9kZS1kZW1vLWNsaWVudC05OS5jbGVyay5hY2NvdW50cy5kZXYk",
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || "/" : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(153, 93%, 21%)",
    colorForeground: "hsl(215, 28%, 17%)",
    colorMutedForeground: "hsl(215, 16%, 47%)",
    colorBackground: "hsl(0, 0%, 100%)",
    colorInput: "hsl(0, 0%, 100%)",
    colorInputForeground: "hsl(215, 28%, 17%)",
    colorDanger: "hsl(0, 84%, 60%)",
    colorNeutral: "hsl(214, 32%, 91%)",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl border border-border",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-2xl font-bold font-serif text-secondary",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButtonText: "text-secondary font-medium",
    formFieldLabel: "text-secondary font-medium",
    footerActionLink: "text-primary hover:text-primary/90 font-medium",
    footerActionText: "text-muted-foreground",
    dividerText: "text-muted-foreground",
    formFieldInput: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    formButtonPrimary: "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4",
  },
};

function ClerkQueryClientCacheInvalidator() {
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  try {
    const { addListener } = useClerk();
    useEffect(() => {
      if (!addListener) return;
      const unsubscribe = addListener(({ user }) => {
        const userId = user?.id ?? null;
        if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
          queryClient.clear();
        }
        prevUserIdRef.current = userId;
      });
      return unsubscribe;
    }, [addListener, queryClient]);
  } catch (_) {}

  return null;
}

function ProtectedRoute({ component: Component, ...rest }: any) {
  if (!isClerkConfigured) {
    return (
      <Route {...rest}>
        <AppLayout>
          <Component />
        </AppLayout>
      </Route>
    );
  }

  return (
    <Route {...rest}>
      <Show when="signed-in" fallback={<Redirect to="/sign-in" />}>
        <AppLayout>
          <Component />
        </AppLayout>
      </Show>
    </Route>
  );
}

function HomeRedirect() {
  if (!isClerkConfigured) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <LandingPage />
      </Show>
    </>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRoutes() {
  return (
    <QueryClientProvider client={queryClient}>
      <ClerkQueryClientCacheInvalidator />
      <Switch>
        <Route path="/" component={HomeRedirect} />
        <Route path="/sign-in/*?">
          <div className="flex min-h-[100dvh] items-center justify-center bg-muted/30 px-4">
            <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
          </div>
        </Route>
        <Route path="/sign-up/*?">
          <div className="flex min-h-[100dvh] items-center justify-center bg-muted/30 px-4">
            <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
          </div>
        </Route>
        
        <ProtectedRoute path="/dashboard" component={DashboardPage} />
        <ProtectedRoute path="/resumes" component={ResumesPage} />
        <ProtectedRoute path="/resumes/:id" component={ResumeDetailPage} />
        <ProtectedRoute path="/jobs" component={JobsPage} />
        <ProtectedRoute path="/jobs/:id" component={JobDetailPage} />
        <ProtectedRoute path="/interviews" component={InterviewsPage} />
        <ProtectedRoute path="/interviews/:id" component={InterviewDetailPage} />
        <ProtectedRoute path="/roadmaps" component={RoadmapsPage} />
        <ProtectedRoute path="/roadmaps/:id" component={RoadmapDetailPage} />
        <ProtectedRoute path="/cover-letters" component={CoverLettersPage} />
        <ProtectedRoute path="/projects" component={ProjectsPage} />
        <ProtectedRoute path="/questions" component={QuestionsPage} />
        <ProtectedRoute path="/chat" component={ChatPage} />
        <ProtectedRoute path="/profile" component={ProfilePage} />
        
        <Route>
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
              <h1 className="text-6xl font-bold mb-4 font-serif text-secondary">404</h1>
              <p className="text-muted-foreground mb-6 text-lg">The page you are looking for doesn't exist.</p>
              <a href="/dashboard" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                Return Dashboard
              </a>
            </div>
          </div>
        </Route>
      </Switch>
    </QueryClientProvider>
  );
}

function App() {
  const [, setLocation] = useLocation();

  if (!clerkPubKey) {
    return (
      <WouterRouter base={basePath}>
        <AppRoutes />
      </WouterRouter>
    );
  }

  return (
    <WouterRouter base={basePath}>
      <ClerkProvider
        publishableKey={clerkPubKey}
        proxyUrl={clerkProxyUrl}
        appearance={clerkAppearance}
        signInUrl={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        routerPush={(to) => setLocation(stripBase(to))}
        routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
      >
        <AppRoutes />
      </ClerkProvider>
    </WouterRouter>
  );
}

export default App;
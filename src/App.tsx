import { Toaster } from "@/shared/components/ui/Toaster";
import { Toaster as Sonner } from "@/shared/components/ui/Sonner";
import { TooltipProvider } from "@/shared/components/ui/Tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { ClerkProvider } from "@clerk/react";
import { AuthProvider } from "@/features/auth/contexts/AuthContext";
import RequireAuth from "@/features/auth/components/RequireAuth";
import { clerkAppearance } from "@/features/auth/clerkAppearance";
import Index from "@/features/dashboard/pages/Index";
import Login from "@/features/auth/pages/Login";
import NotFound from "@/pages/NotFound";
import { LoadingScreen } from "@/shared/components/LoadingScreen";
import { MusicProvider } from "@/shared/contexts/MusicContext";
import { AudioButton } from "@/shared/components/ui/AudioButton";
import { AudioProvider } from "@/shared/contexts/AudioContext";
import { SoundEffectProvider } from "@/shared/contexts/SoundEffectContext";
import { ApiError } from "@/shared/services/httpService";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // A 4xx won't change on retry; show it right away. Network hiccups and
      // server errors get two more tries.
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status >= 400 && error.status < 500) &&
        failureCount < 2,
    },
  },
});

// The title screen and menu load up front; the rest arrive when first opened
const CategorySelect = lazy(() => import("@/features/game/pages/CategorySelect"));
const Game = lazy(() => import("@/features/game/pages/Game"));
const Results = lazy(() => import("@/features/game/pages/Results"));
const Versus = lazy(() => import("@/features/versus/pages/Versus"));
const Scoreboard = lazy(() => import("@/features/dashboard/pages/Scoreboard"));

const PAGE_TITLES: Record<string, string> = {
  "/login": "Play",
  "/signup": "Sign up",
  "/": "Main menu",
  "/category": "Choose a category",
  "/game": "In battle",
  "/results": "Game over",
  "/versus": "1v1 duel",
  "/scoreboard": "Scoreboard",
};

/** Names each screen in the browser tab and for screen readers. */
const PageTitle = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    const page = PAGE_TITLES[pathname] ?? "Page not found";
    document.title = `${page} · ByteBound`;
  }, [pathname]);
  return null;
};

interface AppProps {
  clerkPublishableKey: string;
}

const AppRoutes = ({ clerkPublishableKey }: AppProps) => {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      appearance={clerkAppearance}
      signInUrl="/login"
      signUpUrl="/signup"
      afterSignOutUrl="/login"
      // Let Clerk navigate inside the SPA instead of reloading the page
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      <AuthProvider>
        <PageTitle />
        <main>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/login" element={<Login mode="sign-in" />} />
              <Route path="/signup" element={<Login mode="sign-up" />} />
              <Route element={<RequireAuth />}>
                <Route path="/" element={<Index />} />
                <Route path="/category" element={<CategorySelect />} />
                <Route path="/game" element={<Game />} />
                <Route path="/results" element={<Results />} />
                <Route path="/versus" element={<Versus />} />
                <Route path="/scoreboard" element={<Scoreboard />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <AudioButton />
      </AuthProvider>
    </ClerkProvider>
  );
};

const App = ({ clerkPublishableKey }: AppProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AudioProvider>
          <MusicProvider>
            <SoundEffectProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppRoutes clerkPublishableKey={clerkPublishableKey} />
              </BrowserRouter>
            </SoundEffectProvider>
          </MusicProvider>
        </AudioProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

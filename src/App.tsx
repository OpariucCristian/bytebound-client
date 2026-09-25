import { Toaster } from "@/shared/components/ui/Toaster";
import { Toaster as Sonner } from "@/shared/components/ui/Sonner";
import { TooltipProvider } from "@/shared/components/ui/Tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { ClerkProvider } from "@clerk/react";
import { AuthProvider } from "@/features/auth/contexts/AuthContext";
import RequireAuth from "@/features/auth/components/RequireAuth";
import { clerkAppearance } from "@/features/auth/clerkAppearance";
import Index from "@/features/dashboard/pages/Index";
import Login from "@/features/auth/pages/Login";
import CategorySelect from "@/features/game/pages/CategorySelect";
import Game from "@/features/game/pages/Game";
import Results from "@/features/game/pages/Results";
import NotFound from "@/pages/NotFound";
import { MusicProvider } from "@/shared/contexts/MusicContext";
import { AudioButton } from "@/shared/components/ui/AudioButton";
import { AudioProvider } from "@/shared/contexts/AudioContext";
import { SoundEffectProvider } from "@/shared/contexts/SoundEffectContext";
import Scoreboard from "./features/dashboard/pages/Scoreboard";

const queryClient = new QueryClient();

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
        <Routes>
          <Route path="/login" element={<Login mode="sign-in" />} />
          <Route path="/signup" element={<Login mode="sign-up" />} />
          <Route element={<RequireAuth />}>
            <Route path="/" element={<Index />} />
            <Route path="/category" element={<CategorySelect />} />
            <Route path="/game" element={<Game />} />
            <Route path="/results" element={<Results />} />
            <Route path="/scoreboard" element={<Scoreboard />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
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

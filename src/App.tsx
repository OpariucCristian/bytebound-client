import { Toaster } from "@/shared/components/ui/Toaster";
import { Toaster as Sonner } from "@/shared/components/ui/Sonner";
import { TooltipProvider } from "@/shared/components/ui/Tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/features/auth/contexts/AuthContext";
import Index from "@/features/dashboard/pages/Index";
import Login from "@/features/auth/pages/Login";
import EmailConfirmation from "@/features/auth/pages/EmailConfirmation";
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

const App = () => {
  return (<QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <AudioProvider>
          <MusicProvider>
            <SoundEffectProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/email-confirmation"
                    element={<EmailConfirmation />}
                  />
                  <Route path="/category" element={<CategorySelect />} />
                  <Route path="/game" element={<Game />} />
                  <Route path="/results" element={<Results />} />
                  <Route path="/scoreboard" element={<Scoreboard />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <AudioButton />
              </BrowserRouter>
            </SoundEffectProvider>
          </MusicProvider>
        </AudioProvider>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>)
};

export default App;

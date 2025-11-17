import { Toaster } from "@/components/ui/Toaster";
import { Toaster as Sonner } from "@/components/ui/Sonner";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import EmailConfirmation from "./pages/EmailConfirmation";
import CategorySelect from "./pages/CategorySelect";
import Game from "./pages/Game";
import Results from "./pages/Results";
import NotFound from "./pages/NotFound";
import { MusicProvider } from "./contexts/MusicContext";
import { AudioButton } from "./components/ui/AudioButton";
import { AudioProvider } from "./contexts/AudioContext";
import { SoundEffectProvider } from "./contexts/SoundEffectContext";

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

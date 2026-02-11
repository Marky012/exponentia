import { useEffect, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useGameStore } from "@/store/gameStore";
import { backgroundMusic } from "@/utils/backgroundMusic";
import Index from "./pages/Index";
import Welcome from "./pages/Welcome";
import Intro from "./pages/Intro";
import GameHub from "./pages/GameHub";
import Laws from "./pages/Laws";
import LawLearn from "./pages/LawLearn";
import PreTest from "./pages/PreTest";
import Quiz from "./pages/Quiz";
import QuizArena from "./pages/QuizArena";
import QuizResult from "./pages/QuizResult";
import Statistics from "./pages/Statistics";
import StudentReport from "./pages/StudentReport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to apply theme and start background music
const ThemeInitializer = ({ children }: { children: React.ReactNode }) => {
  const playerGender = useGameStore((state) => state.playerGender);
  
  useEffect(() => {
    if (playerGender === 'female') {
      document.body.classList.add('theme-female');
    } else {
      document.body.classList.remove('theme-female');
    }
  }, [playerGender]);

  // Start background music on first user interaction
  const handleFirstInteraction = useCallback(() => {
    backgroundMusic.play();
    document.removeEventListener('click', handleFirstInteraction);
    document.removeEventListener('keydown', handleFirstInteraction);
    document.removeEventListener('touchstart', handleFirstInteraction);
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [handleFirstInteraction]);
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ThemeInitializer>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/intro" element={<Intro />} />
            <Route path="/hub" element={<GameHub />} />
            <Route path="/laws" element={<Laws />} />
            <Route path="/law/:lawId" element={<LawLearn />} />
            <Route path="/pretest/:lawId" element={<PreTest />} />
            <Route path="/quiz-arena" element={<QuizArena />} />
            <Route path="/quiz/:levelId" element={<Quiz />} />
            <Route path="/quiz-result/:levelId" element={<QuizResult />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/report" element={<StudentReport />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ThemeInitializer>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { useEffect, useCallback, Suspense, lazy } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { backgroundMusic } from "@/utils/backgroundMusic";
import { applyGenderTheme, initTheme } from "@/utils/theme";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import Index from "./pages/Index";
import { PageSkeleton } from "@/components/PageSkeleton";
import { PageTransition } from "@/components/PageTransition";

const Welcome = lazy(() => import("./pages/Welcome"));
const Intro = lazy(() => import("./pages/Intro"));
const GameHub = lazy(() => import("./pages/GameHub"));
const Laws = lazy(() => import("./pages/Laws"));
const LawLearn = lazy(() => import("./pages/LawLearn"));
const PreTest = lazy(() => import("./pages/PreTest"));
const Quiz = lazy(() => import("./pages/Quiz"));
const QuizArena = lazy(() => import("./pages/QuizArena"));
const QuizResult = lazy(() => import("./pages/QuizResult"));
const Statistics = lazy(() => import("./pages/Statistics"));
const StudentReport = lazy(() => import("./pages/StudentReport"));
const NotFound = lazy(() => import("./pages/NotFound"));

const ThemeInitializer = ({ children }: { children: React.ReactNode }) => {
  const playerGender = useGameStore((state) => state.playerGender);
  
  useEffect(() => {
    initTheme();
    applyGenderTheme(playerGender);
  }, [playerGender]);

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

const getTransitionVariant = (pathname: string): 'default' | 'battle' | 'portal' => {
  if (pathname.startsWith('/quiz/') || pathname.startsWith('/pretest/')) return 'battle';
  if (pathname === '/hub' || pathname === '/laws' || pathname.startsWith('/law/')) return 'portal';
  return 'default';
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const variant = getTransitionVariant(location.pathname);

  return (
    <AnimatePresence mode="wait">
      <PageTransition key={location.pathname} variant={variant}>
        <Routes location={location}>
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageTransition>
    </AnimatePresence>
  );
};

const App = () => (
  <ErrorBoundary>
    <TooltipProvider>
      <Sonner />
      <OfflineIndicator />
      <BrowserRouter>
        <ThemeInitializer>
          <Suspense fallback={<PageSkeleton />}>
            <AnimatedRoutes />
          </Suspense>
        </ThemeInitializer>
      </BrowserRouter>
    </TooltipProvider>
  </ErrorBoundary>
);

export default App;

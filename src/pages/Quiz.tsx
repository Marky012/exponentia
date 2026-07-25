import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MathText } from '@/utils/mathRenderer';
import questionsData from '@/data/questions.json';
import { Shield, Swords, Skull, CheckCircle2, X, ArrowLeft, ChevronDown, Maximize2, Sword, Lightbulb } from 'lucide-react';
import { HintHelper } from '@/components/HintHelper';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { soundEffects } from '@/utils/soundEffects';
import { haptics } from '@/utils/haptics';
import { generateExplanation } from '@/utils/questionExplanations';
import exponentiaDark from '@/assets/exponentia-dark.png';
import { SettingsMenu } from '@/components/SettingsMenu';
import { isDevelopmentMode } from '@/utils/inputValidation';
import { PASSING_SCORE, QUIZ_LENGTH, ANSWER_FEEDBACK_DELAY } from '@/constants/gameConfig';
import { LAW_HINTS_BY_NAME } from '@/constants/lawHints';
import { shuffleQuestionOptions, weightedShuffle } from '@/utils/shuffle';
import { Question } from '@/types/game';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Quiz() {
  const { levelId } = useParams<{ levelId: 'easy' | 'medium' | 'hard' }>();
  const navigate = useNavigate();
  const quizLevels = useGameStore((state) => state.quizLevels);
  const debugMode = useGameStore((state) => state.debugMode);
  const trackAnswer = useGameStore((state) => state.trackAnswer);
  const questionHistory = useGameStore((state) => state.questionHistory);
  const recordQuestionAnswer = useGameStore((state) => state.recordQuestionAnswer);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ questionId: string; correct: boolean; lawTested: string }[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [showExpandedQuestion, setShowExpandedQuestion] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const currentLevel = quizLevels.find(l => l.id === levelId);

  const isDevMode = isDevelopmentMode();
  
  useEffect(() => {
    if (!levelId || (!currentLevel?.unlocked && !(debugMode && isDevMode))) {
      navigate('/quiz-arena');
      return;
    }

    if (currentLevel && currentLevel.attempts.length >= 3 && !currentLevel.completed) {
      navigate('/quiz-arena');
      return;
    }

    const allQuestions = questionsData[levelId] as Question[];
    const selected = weightedShuffle(allQuestions, questionHistory, QUIZ_LENGTH).map(shuffleQuestionOptions);
    setQuestions(selected);
  }, [levelId, currentLevel, navigate, debugMode, isDevMode, questionHistory]);

  useEffect(() => {
    if (questions.length === 0) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [questions.length]);

  useEffect(() => {
    if (questions.length === 0) return;
    const handlePopState = () => {
      if (confirm('Are you sure you want to leave the battle? Your progress will be lost.')) {
        navigate('/quiz-arena');
      } else {
        window.history.pushState(null, '', window.location.pathname);
      }
    };
    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [questions.length, navigate]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (optionIndex: number) => {
    if (showFeedback) return;
    soundEffects.playClick();
    setSelectedAnswer(optionIndex);
    optionsRef.current[optionIndex]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, optionIndex: number) => {
    if (showFeedback) return;
    const keyMap: Record<string, number> = { ArrowDown: optionIndex + 1, ArrowUp: optionIndex - 1 };
    if (keyMap[e.key] !== undefined && keyMap[e.key] < currentQuestion.options.length && keyMap[e.key] >= 0) {
      e.preventDefault();
      optionsRef.current[keyMap[e.key]]?.focus();
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleAnswerSelect(optionIndex);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctIndex;
    setLastAnswerCorrect(isCorrect);
    trackAnswer(isCorrect);
    recordQuestionAnswer(currentQuestion.id, isCorrect);
    setAnswers([
      ...answers,
      { questionId: currentQuestion.id, correct: isCorrect, lawTested: currentQuestion.lawTested },
    ]);
    setShowFeedback(true);
    setShowExplanation(true);

    if (isCorrect) {
      soundEffects.playCorrect();
      haptics.success();
    } else {
      soundEffects.playIncorrect();
      haptics.error();
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setLastAnswerCorrect(null);
        setShowExplanation(false);
      } else {
        const allAnswers = [...answers, { questionId: currentQuestion.id, correct: isCorrect, lawTested: currentQuestion.lawTested }];
        const correctCount = allAnswers.filter(a => a.correct).length;
        const score = Math.round((correctCount / questions.length) * 100);
        const missedLaws = allAnswers.filter(a => !a.correct).map(a => a.lawTested);
        
        if (score >= PASSING_SCORE) {
          soundEffects.playVictory();
          haptics.success();
        }
        
        navigate(`/quiz-result/${levelId}`, { 
          state: { score, correctCount, totalQuestions: questions.length, missedLaws: Array.from(new Set(missedLaws)) } 
        });
      }
    }, ANSWER_FEEDBACK_DELAY);
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center">
        <div className="text-center space-y-4 w-full max-w-md px-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground font-orbitron">Preparing your battle...</p>
          <div className="space-y-2 pt-2">
            <div className="h-3 w-full bg-muted/40 rounded animate-pulse" />
            <div className="h-3 w-2/3 bg-muted/30 rounded animate-pulse mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  const enemyNames = { easy: 'Shadow Nuller', medium: 'Void Nuller', hard: 'Chaos Nuller' };

  const explanation = generateExplanation({
    lawTested: currentQuestion.lawTested,
    question: currentQuestion.question,
    correctAnswer: currentQuestion.options[currentQuestion.correctIndex],
    options: currentQuestion.options,
  });

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)), url(${exponentiaDark})` }}
    >
      <a href="#quiz-options" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded">
        Skip to answer options
      </a>
      <motion.div 
        className="border-b border-border/50 bg-card/50 backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Button variant="ghost" size="icon" onClick={() => navigate('/quiz-arena')} className="flex-shrink-0 w-11 h-11" aria-label="Back to Quiz Arena">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Swords className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-orbitron font-bold text-foreground truncate">
                  {currentLevel?.name} Battle
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">vs {enemyNames[levelId!]}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0" role="status" aria-label={`Score: ${answers.filter(a => a.correct).length} correct, ${answers.filter(a => !a.correct).length} incorrect`}>
              <motion.div className="flex items-center gap-2" animate={lastAnswerCorrect === true ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
                <Shield className="w-5 h-5 text-green-500" aria-hidden="true" />
                <span className="font-bold text-green-500">{answers.filter(a => a.correct).length}</span>
              </motion.div>
              <motion.div className="flex items-center gap-2" animate={lastAnswerCorrect === false ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
                <Skull className="w-5 h-5 text-red-500" aria-hidden="true" />
                <span className="font-bold text-red-500">{answers.filter(a => !a.correct).length}</span>
              </motion.div>
              <SettingsMenu />
            </div>
          </div>
          <div className="mt-3">
            <Progress value={progress} className="h-2" role="progressbar" aria-valuenow={currentQuestionIndex + 1} aria-valuemin={1} aria-valuemax={questions.length} aria-label={`Question ${currentQuestionIndex + 1} of ${questions.length}`} />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={cn(
              "p-4 sm:p-6 bg-primary/15 backdrop-blur-sm border-2 transition-all duration-300 card-learning",
              lastAnswerCorrect === true && "border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]",
              lastAnswerCorrect === false && "border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-shake",
              lastAnswerCorrect === null && "border-primary/60"
            )}>
              <div className="mb-4 sm:mb-6">
                <div className="relative">
                  <div 
                    ref={scrollContainerRef}
                    className="max-h-[120px] sm:max-h-[150px] overflow-y-auto overflow-x-hidden pr-2"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: 'hsl(var(--primary) / 0.3) transparent' }}
                    onScroll={(e) => {
                      const target = e.target as HTMLDivElement;
                      const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 10;
                      if (isAtBottom && showScrollIndicator) setShowScrollIndicator(false);
                      else if (!isAtBottom && target.scrollHeight > target.clientHeight && !showScrollIndicator) setShowScrollIndicator(true);
                    }}
                  >
                    <h2 
                      className="text-sm sm:text-base md:text-lg font-bold text-foreground leading-relaxed whitespace-pre-wrap"
                      style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                      ref={(el) => {
                        setTimeout(() => {
                          if (scrollContainerRef.current) {
                            const hasOverflow = scrollContainerRef.current.scrollHeight > scrollContainerRef.current.clientHeight;
                            if (hasOverflow !== showScrollIndicator) setShowScrollIndicator(hasOverflow);
                          }
                        }, 100);
                      }}
                    >
                      <MathText>{currentQuestion.question}</MathText>
                    </h2>
                  </div>
                  
                  {showScrollIndicator && (
                    <Button variant="ghost" size="sm" className="absolute top-0 right-0 p-1 h-auto opacity-70 hover:opacity-100" onClick={() => setShowExpandedQuestion(true)} aria-label="Expand question">
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {showScrollIndicator && (
                    <div className="absolute bottom-0 left-0 right-0 flex justify-center pointer-events-none transition-opacity duration-300" style={{ background: 'linear-gradient(to top, hsl(var(--card)) 0%, transparent 100%)', paddingTop: '20px', paddingBottom: '4px' }}>
                      <div className="flex items-center gap-1 text-xs text-primary animate-bounce">
                        <ChevronDown className="w-4 h-4" aria-hidden="true" />
                        <span>Scroll down or tap expand</span>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">Law: {currentQuestion.lawTested}</p>
              </div>
              
              <Dialog open={showExpandedQuestion} onOpenChange={setShowExpandedQuestion}>
                <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-sm text-muted-foreground">
                      Question {currentQuestionIndex + 1} — {currentQuestion.lawTested}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <h2 className="text-lg sm:text-xl font-bold text-foreground leading-relaxed whitespace-pre-wrap">
                      <MathText>{currentQuestion.question}</MathText>
                    </h2>
                  </div>
                </DialogContent>
              </Dialog>

              <div id="quiz-options" className="space-y-2 sm:space-y-3" role="radiogroup" aria-label={`Answer options for question ${currentQuestionIndex + 1}`}>
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === currentQuestion.correctIndex;
                  const showCorrect = showFeedback && isCorrect;
                  const showIncorrect = showFeedback && isSelected && !isCorrect;
                  const isDebugHighlight = debugMode && isDevMode && isCorrect && !showFeedback;

                  return (
                    <motion.button
                      key={index}
                      ref={(el) => { optionsRef.current[index] = el; }}
                      onClick={() => handleAnswerSelect(index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      disabled={showFeedback}
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`Option ${String.fromCharCode(65 + index)}: ${option}${showCorrect ? ' (correct)' : ''}${showIncorrect ? ' (incorrect)' : ''}`}
                      tabIndex={isSelected ? 0 : -1}
                      className={cn(
                        "w-full p-3 sm:p-4 rounded-lg border-2 transition-all text-left relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                        showCorrect && "bg-green-500/20 border-green-500 text-green-400 font-bold",
                        showIncorrect && "bg-red-500/20 border-red-500 text-red-400",
                        !showFeedback && isSelected && "bg-primary/20 border-primary text-primary",
                        !showFeedback && !isSelected && "bg-card border-border hover:border-primary/50 text-foreground",
                        isDebugHighlight && "ring-2 ring-green-500/50 ring-offset-1 ring-offset-background border-green-500/30 bg-green-500/5"
                      )}
                      whileHover={!showFeedback ? { scale: 1.01 } : {}}
                      whileTap={!showFeedback ? { scale: 0.99 } : {}}
                    >
                      {isDebugHighlight && (
                        <div className="absolute top-1 right-1 bg-green-500 text-white text-[8px] px-1 rounded font-bold uppercase" aria-hidden="true">✓</div>
                      )}
                      
                      {showFeedback && (showCorrect || showIncorrect) && (
                        <motion.div className={cn("absolute inset-0 opacity-10", showCorrect ? "bg-green-500" : "bg-red-500")} initial={{ scale: 0, borderRadius: "100%" }} animate={{ scale: 3, borderRadius: "0%" }} transition={{ duration: 0.5 }} />
                      )}
                      
                      <div className="flex items-center gap-2 sm:gap-3 relative z-10">
                        <span className={cn(
                          "flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full font-bold transition-all text-xs sm:text-sm flex-shrink-0",
                          showCorrect && "bg-green-500 text-white",
                          showIncorrect && "bg-red-500 text-white",
                          !showFeedback && isDebugHighlight && "bg-green-500/20 text-green-400",
                          !showFeedback && !isDebugHighlight && "bg-background/50"
                        )} aria-hidden="true">
                          {showFeedback && isSelected ? (
                            isCorrect ? <CheckCircle2 className="w-3 h-3 sm:w-5 sm:h-5" /> : <X className="w-3 h-3 sm:w-5 sm:h-5" />
                          ) : showFeedback && isCorrect ? (
                            <CheckCircle2 className="w-3 h-3 sm:w-5 sm:h-5" />
                          ) : (
                            String.fromCharCode(65 + index)
                          )}
                        </span>
                        <span className={cn("flex-1 break-words", levelId === 'hard' ? "text-xs sm:text-sm" : "text-sm sm:text-base")}>
                          <MathText>{option}</MathText>
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {!showFeedback && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                  <Button onClick={handleSubmitAnswer} disabled={selectedAnswer === null} className="w-full mt-6 gap-2 text-base font-orbitron glow" size="lg" aria-label="Submit answer">
                    <Sword className="w-5 h-5" />
                    Attack!
                  </Button>
                </motion.div>
              )}

              {showFeedback && (
                <motion.div 
                  className={cn(
                    "mt-6 p-4 rounded-lg border-2",
                    lastAnswerCorrect 
                      ? "bg-green-500/20 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]" 
                      : "bg-red-500/20 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                  )}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                >
                  <p className="font-bold font-orbitron flex items-center gap-2 text-sm">
                    {lastAnswerCorrect ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-green-500" aria-hidden="true" />
                        <span className="text-green-400">Strike True!</span>
                      </>
                    ) : (
                      <>
                        <X className="w-5 h-5 text-red-500" aria-hidden="true" />
                        <span className="text-red-400">The Nuller Deflects!</span>
                      </>
                    )}
                  </p>
                  {!lastAnswerCorrect && (
                    <p className="text-sm mt-1 text-muted-foreground">
                      The correct answer is: <MathText>{currentQuestion.options[currentQuestion.correctIndex]}</MathText>
                    </p>
                  )}

                  {showExplanation && (
                    <motion.div 
                      className="mt-3 p-3 bg-background/30 rounded-lg border border-primary/10"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ delay: 0.3 }}
                    >
                      <p className="text-xs font-semibold text-primary flex items-center gap-1 mb-1">
                        <Lightbulb className="w-3 h-3" aria-hidden="true" />
                        Explanation
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{explanation}</p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>

        <HintHelper
          hint={LAW_HINTS_BY_NAME[currentQuestion.lawTested] || 'Remember the laws of exponents you learned!'}
          onHintUsed={() => setHintUsed(true)}
          hintAvailable={!hintUsed}
        />
      </div>
    </div>
  );
}

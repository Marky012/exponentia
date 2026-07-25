import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MathDisplay } from '@/utils/mathRenderer';
import { ArrowLeft, Trophy, XCircle, Sparkles, CheckCircle2, X, SkipForward, Bug, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import questionsData from '@/data/questions.json';
import trainingArena from '@/assets/training-arena.png';
import { soundEffects } from '@/utils/soundEffects';
import { haptics } from '@/utils/haptics';
import { isDevelopmentMode } from '@/utils/inputValidation';
import { generateExplanation } from '@/utils/questionExplanations';
import { SettingsMenu } from '@/components/SettingsMenu';
import ExponentiaBackground from '@/components/ExponentiaBackground';
import { PRETEST_QUESTION_COUNT, PRETEST_PASSING_SCORE, ANSWER_FEEDBACK_DELAY } from '@/constants/gameConfig';
import { LAW_ID_TO_PRETEST_KEY } from '@/constants/quizConfig';
import { shuffleArray, shuffleQuestionOptions } from '@/utils/shuffle';
import { Question } from '@/types/game';

const PreTest = () => {
  const { lawId } = useParams();
  const navigate = useNavigate();
  const { laws, earnGem, debugMode, trackAnswer } = useGameStore();
  
  const law = laws.find((l) => l.id === lawId);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const optionsRef = useRef<(HTMLButtonElement | null)[]>([]);
  
  const isDevMode = isDevelopmentMode();

  useEffect(() => {
    if (!law || !lawId) { navigate('/laws'); return; }
    const preTestKey = LAW_ID_TO_PRETEST_KEY[lawId];
    const preTestQuestions = preTestKey ? (questionsData.preTest as Record<string, Question[]>)[preTestKey] : null;
    if (preTestQuestions && preTestQuestions.length >= PRETEST_QUESTION_COUNT) {
      const shuffledQuestions = shuffleArray(preTestQuestions).slice(0, PRETEST_QUESTION_COUNT);
      setQuestions(shuffledQuestions.map(shuffleQuestionOptions));
    } else {
      toast.error('Pre-test questions not available for this law');
      navigate('/laws');
    }
  }, [lawId, law, navigate]);

  if (!law || questions.length === 0) return null;

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;
    soundEffects.playClick();
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    
    const isCorrect = answerIndex === currentQuestion.correctIndex;
    setLastAnswerCorrect(isCorrect);
    trackAnswer(isCorrect);
    setShowExplanation(true);
    
    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
      soundEffects.playCorrect();
      haptics.success();
      toast.success('Correct! Well done!', { icon: <CheckCircle2 className="w-5 h-5 text-green-500" /> });
    } else {
      soundEffects.playIncorrect();
      haptics.error();
      toast.error('Incorrect. Keep trying!', { icon: <X className="w-5 h-5 text-red-500" /> });
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setLastAnswerCorrect(null);
        setShowExplanation(false);
      } else {
        setTestCompleted(true);
        setShowResult(true);
        if (correctAnswers + (isCorrect ? 1 : 0) === PRETEST_PASSING_SCORE) soundEffects.playVictory();
      }
    }, ANSWER_FEEDBACK_DELAY);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (isAnswered) return;
    const keyMap: Record<string, number> = { ArrowDown: index + 1, ArrowUp: index - 1 };
    if (keyMap[e.key] !== undefined && keyMap[e.key] < currentQuestion.options.length && keyMap[e.key] >= 0) {
      e.preventDefault();
      optionsRef.current[keyMap[e.key]]?.focus();
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleAnswerSelect(index);
    }
  };

  const handleDebugSkipToEnd = () => {
    if (!debugMode || !isDevMode) return;
    setCorrectAnswers(5);
    setTestCompleted(true);
    setShowResult(true);
    soundEffects.playVictory();
    toast.success('Debug: Skipped to victory!', { icon: <Bug className="w-4 h-4" /> });
  };

  const handleDebugSkipQuestion = () => {
    if (!debugMode || !isDevMode || isAnswered) return;
    setCorrectAnswers((prev) => prev + 1);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      toast.success('Debug: Question skipped!', { icon: <SkipForward className="w-4 h-4" /> });
    } else {
      setTestCompleted(true);
      setShowResult(true);
      soundEffects.playVictory();
    }
  };

  const handleComplete = () => {
    if (correctAnswers === PRETEST_PASSING_SCORE) {
      earnGem(law.id);
      toast.success(`${law.name} gem earned!`);
    }
    navigate('/laws');
  };

  const handleRetry = () => {
    const preTestKey = LAW_ID_TO_PRETEST_KEY[lawId || ''];
    const preTestQuestions = preTestKey ? (questionsData.preTest as Record<string, Question[]>)[preTestKey] : null;
    if (preTestQuestions && preTestQuestions.length >= PRETEST_QUESTION_COUNT) {
      setQuestions(shuffleArray(preTestQuestions).slice(0, PRETEST_QUESTION_COUNT).map(shuffleQuestionOptions));
    }
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setCorrectAnswers(0);
    setShowResult(false);
    setIsAnswered(false);
    setTestCompleted(false);
    setLastAnswerCorrect(null);
    setShowExplanation(false);
  };

  const currentExplanation = currentQuestion ? generateExplanation({
    lawTested: currentQuestion.lawTested,
    question: currentQuestion.question,
    correctAnswer: currentQuestion.options[currentQuestion.correctIndex],
    options: currentQuestion.options,
  }) : '';

  if (showResult) {
    const passed = correctAnswers === PRETEST_PASSING_SCORE;
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center relative">
        <ExponentiaBackground overlayOpacity={0.5} />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="relative z-10">
          <Card className="max-w-2xl w-full p-8 bg-primary/15 backdrop-blur-sm border-2 border-primary/60 card-learning text-center">
            <motion.div 
              className={cn("w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center", passed ? "bg-gem/20 border-4 border-gem" : "bg-destructive/20 border-4 border-destructive")}
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              {passed ? (
                <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 0.5, delay: 0.5 }}>
                  <Trophy className="w-10 h-10 text-gem" />
                </motion.div>
              ) : (
                <motion.div animate={{ x: [-5, 5, -5, 5, 0] }} transition={{ duration: 0.4, delay: 0.3 }}>
                  <XCircle className="w-10 h-10 text-destructive" />
                </motion.div>
              )}
            </motion.div>
            <motion.h1 className="text-3xl font-orbitron font-bold mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              {passed ? 'Gem Earned!' : 'Not Quite There'}
            </motion.h1>
            <motion.p className="text-lg text-muted-foreground mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              You answered <span className="font-bold text-primary">{correctAnswers}/{PRETEST_PASSING_SCORE}</span> questions correctly
            </motion.p>
            {passed ? (
              <motion.div className="bg-gradient-to-r from-gem/10 to-gem/5 border border-gem/30 rounded-lg p-4 mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-gem animate-pulse" />
                  <p className="font-semibold text-gem">Perfect Score!</p>
                  <Sparkles className="w-5 h-5 text-gem animate-pulse" />
                </div>
                <p className="text-sm text-muted-foreground">You've mastered the {law.name} and earned its gem!</p>
              </motion.div>
            ) : (
              <motion.div className="bg-muted/20 border border-border rounded-lg p-4 mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <p className="text-sm text-muted-foreground">You need all 5 questions correct to earn the gem. Review the lesson and try again!</p>
              </motion.div>
            )}
            <motion.div className="flex gap-4 justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              {!passed && <Button onClick={handleRetry} variant="ghost" className="bg-primary/15 border border-primary/60 hover:bg-primary/25 text-primary">Try Again</Button>}
              <Button onClick={handleComplete}>{passed ? 'Continue' : 'Back to Laws'}</Button>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-8 bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)), url(${trainingArena})` }}>
      <a href="#pretest-options" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded">
        Skip to answer options
      </a>
      <div className="max-w-4xl mx-auto">
        <motion.div className="flex items-center justify-between mb-4 sm:mb-6 gap-2" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <Button variant="ghost" size="icon" className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 bg-primary/15 border border-primary/60 hover:bg-primary/25 text-primary" onClick={() => navigate('/laws')} aria-label="Back to Laws">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-orbitron font-bold text-primary truncate">Pre-Test: {law.name}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Get {PRETEST_PASSING_SCORE}/{PRETEST_PASSING_SCORE} correct to earn the gem</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs sm:text-sm text-muted-foreground">Score</p>
            <p className="text-xl sm:text-2xl font-orbitron font-bold text-gem">{correctAnswers}/{PRETEST_PASSING_SCORE}</p>
          </div>
          <SettingsMenu />
        </motion.div>

        <motion.div className="mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <div className="flex items-center gap-2">
              {debugMode && isDevMode && (
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={handleDebugSkipQuestion} disabled={isAnswered} className="h-6 px-2 text-xs border-green-500/50 text-green-400 hover:bg-green-500/20">
                    <SkipForward className="w-3 h-3 mr-1" />Skip
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDebugSkipToEnd} className="h-6 px-2 text-xs border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20">
                    <Bug className="w-3 h-3 mr-1" />Win
                  </Button>
                </div>
              )}
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" role="progressbar" aria-valuenow={currentQuestionIndex + 1} aria-valuemin={1} aria-valuemax={questions.length} aria-label={`Question ${currentQuestionIndex + 1} of ${questions.length}`} />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div key={currentQuestionIndex} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
            <Card className={cn(
              "p-4 sm:p-6 md:p-8 bg-primary/15 backdrop-blur-sm border-2 transition-all duration-300 card-learning",
              lastAnswerCorrect === true && "border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]",
              lastAnswerCorrect === false && "border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-shake",
              lastAnswerCorrect === null && "border-primary/20"
            )}>
              <div className="mb-4 sm:mb-8">
                <MathDisplay className="text-lg sm:text-2xl text-center break-words">{currentQuestion.question}</MathDisplay>
              </div>

              <div id="pretest-options" className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3" role="radiogroup" aria-label={`Answer options for question ${currentQuestionIndex + 1}`}>
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === currentQuestion.correctIndex;
                  const showFeedback = isAnswered;
                  const isDebugHighlight = debugMode && isDevMode && isCorrect && !showFeedback;

                  return (
                    <motion.button
                      key={index}
                      ref={(el) => { optionsRef.current[index] = el; }}
                      onClick={() => handleAnswerSelect(index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      disabled={isAnswered}
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`Option ${String.fromCharCode(65 + index)}: ${option}${showFeedback && isCorrect ? ' (correct)' : ''}${showFeedback && isSelected && !isCorrect ? ' (incorrect)' : ''}`}
                      tabIndex={isSelected ? 0 : -1}
                      className={cn(
                        "p-3 sm:p-4 md:p-6 rounded-lg border-2 transition-all duration-300 text-left relative overflow-hidden min-h-[60px] sm:min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                        !isAnswered && "border-border hover:border-primary hover:bg-primary/10",
                        showFeedback && isSelected && isCorrect && "border-green-500 bg-green-500/20",
                        showFeedback && isSelected && !isCorrect && "border-red-500 bg-red-500/20",
                        showFeedback && !isSelected && isCorrect && "border-green-500/50 bg-green-500/10",
                        showFeedback && !isSelected && !isCorrect && "opacity-50",
                        isDebugHighlight && "ring-2 ring-green-500/50 ring-offset-1 ring-offset-background border-green-500/30 bg-green-500/5"
                      )}
                      whileHover={!isAnswered ? { scale: 1.02 } : {}}
                      whileTap={!isAnswered ? { scale: 0.98 } : {}}
                    >
                      {isDebugHighlight && (
                        <div className="absolute top-1 right-1 bg-green-500 text-white text-[8px] px-1 rounded font-bold uppercase" aria-hidden="true">✓</div>
                      )}
                      
                      {showFeedback && isSelected && (
                        <motion.div className={cn("absolute inset-0 opacity-20", isCorrect ? "bg-green-500" : "bg-red-500")} initial={{ scale: 0, borderRadius: "100%" }} animate={{ scale: 3, borderRadius: "0%" }} transition={{ duration: 0.5 }} />
                      )}
                      
                      <div className="flex items-center gap-2 sm:gap-3 relative z-10">
                        <div className={cn(
                          "w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs sm:text-sm transition-all flex-shrink-0",
                          !isAnswered && !isDebugHighlight && "border-border",
                          !isAnswered && isDebugHighlight && "bg-green-500/20 text-green-400 border-green-500/50",
                          showFeedback && isSelected && isCorrect && "border-green-500 bg-green-500 text-white",
                          showFeedback && isSelected && !isCorrect && "border-red-500 bg-red-500 text-white",
                          showFeedback && !isSelected && isCorrect && "border-green-500 text-green-500"
                        )} aria-hidden="true">
                          {showFeedback && isSelected ? (
                            isCorrect ? <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" /> : <X className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                          ) : (
                            String.fromCharCode(65 + index)
                          )}
                        </div>
                        <MathDisplay className="text-xs sm:text-sm md:text-lg flex-1 break-words leading-relaxed">{option}</MathDisplay>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {showExplanation && (
                <motion.div 
                  className="mt-4 p-3 bg-background/30 rounded-lg border border-primary/10"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  role="alert"
                >
                  <p className="text-xs font-semibold text-primary flex items-center gap-1 mb-1">
                    <Lightbulb className="w-3 h-3" aria-hidden="true" />
                    Explanation
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{currentExplanation}</p>
                </motion.div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PreTest;

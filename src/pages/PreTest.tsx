import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MathDisplay } from '@/utils/mathRenderer';
import { ArrowLeft, Trophy, XCircle, Sparkles, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import questionsData from '@/data/questions.json';
import trainingArena from '@/assets/training-arena.png';
import { soundEffects } from '@/utils/soundEffects';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  lawTested: string;
}

const PreTest = () => {
  const { lawId } = useParams();
  const navigate = useNavigate();
  const { laws, earnGem } = useGameStore();
  
  const law = laws.find((l) => l.id === lawId);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);

  // Map law IDs to preTest JSON keys
  const lawIdToPreTestKey: Record<string, string> = {
    'product': 'product',
    'quotient': 'quotient',
    'power': 'power',
    'zero': 'zero',
    'negative': 'negative',
    'product-power': 'productpower',
    'quotient-power': 'quotientpower',
    'identity': 'identity',
  };

  // Shuffle array function
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    if (!law || !lawId) {
      navigate('/laws');
      return;
    }

    // Map lawId to the correct preTest key
    const preTestKey = lawIdToPreTestKey[lawId];
    const preTestQuestions = preTestKey ? (questionsData.preTest as Record<string, Question[]>)[preTestKey] : null;
    
    if (preTestQuestions && preTestQuestions.length >= 5) {
      // Shuffle questions for randomization
      const shuffled = shuffleArray(preTestQuestions).slice(0, 5);
      setQuestions(shuffled);
    } else {
      toast.error('Pre-test questions not available for this law');
      navigate('/laws');
    }
  }, [lawId, law, navigate]);

  if (!law || questions.length === 0) {
    return null;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;
    
    soundEffects.playClick();
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    
    const isCorrect = answerIndex === currentQuestion.correctIndex;
    setLastAnswerCorrect(isCorrect);
    
    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
      soundEffects.playCorrect();
      toast.success('Correct! Well done!', {
        icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      });
    } else {
      soundEffects.playIncorrect();
      toast.error('Incorrect. Keep trying!', {
        icon: <X className="w-5 h-5 text-red-500" />,
      });
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setLastAnswerCorrect(null);
      } else {
        setTestCompleted(true);
        setShowResult(true);
        if (correctAnswers + (isCorrect ? 1 : 0) === 5) {
          soundEffects.playVictory();
        }
      }
    }, 1500);
  };

  const handleComplete = () => {
    if (correctAnswers === 5) {
      earnGem(law.id);
      toast.success(`${law.name} gem earned! 💎`);
    }
    navigate('/laws');
  };

  const handleRetry = () => {
    // Map lawId to the correct preTest key and reshuffle
    const preTestKey = lawIdToPreTestKey[lawId || ''];
    const preTestQuestions = preTestKey ? (questionsData.preTest as Record<string, Question[]>)[preTestKey] : null;
    
    if (preTestQuestions && preTestQuestions.length >= 5) {
      const shuffled = shuffleArray(preTestQuestions).slice(0, 5);
      setQuestions(shuffled);
    }
    
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setCorrectAnswers(0);
    setShowResult(false);
    setIsAnswered(false);
    setTestCompleted(false);
    setLastAnswerCorrect(null);
  };

  if (showResult) {
    const passed = correctAnswers === 5;
    
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-2xl w-full p-8 bg-card/90 backdrop-blur-sm border-2 border-primary/20 text-center">
            <motion.div 
              className={cn(
                "w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center",
                passed ? "bg-gem/20 border-4 border-gem" : "bg-destructive/20 border-4 border-destructive"
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              {passed ? (
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <Trophy className="w-10 h-10 text-gem" />
                </motion.div>
              ) : (
                <motion.div
                  animate={{ x: [-5, 5, -5, 5, 0] }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <XCircle className="w-10 h-10 text-destructive" />
                </motion.div>
              )}
            </motion.div>

            <motion.h1 
              className="text-3xl font-orbitron font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {passed ? 'Gem Earned!' : 'Not Quite There'}
            </motion.h1>

            <motion.p 
              className="text-lg text-muted-foreground mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              You answered <span className="font-bold text-primary">{correctAnswers}/5</span> questions correctly
            </motion.p>

            {passed ? (
              <motion.div 
                className="bg-gradient-to-r from-gem/10 to-gem/5 border border-gem/30 rounded-lg p-4 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-gem animate-pulse" />
                  <p className="font-semibold text-gem">Perfect Score!</p>
                  <Sparkles className="w-5 h-5 text-gem animate-pulse" />
                </div>
                <p className="text-sm text-muted-foreground">
                  You've mastered the {law.name} and earned its gem!
                </p>
              </motion.div>
            ) : (
              <motion.div 
                className="bg-muted/20 border border-border rounded-lg p-4 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-sm text-muted-foreground">
                  You need all 5 questions correct to earn the gem. Review the lesson and try again!
                </p>
              </motion.div>
            )}

            <motion.div 
              className="flex gap-4 justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {!passed && (
                <Button onClick={handleRetry} variant="outline">
                  Try Again
                </Button>
              )}
              <Button onClick={handleComplete}>
                {passed ? 'Continue' : 'Back to Laws'}
              </Button>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-4 md:p-8 bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)), url(${trainingArena})`
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/laws')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-orbitron font-bold text-glow">
                Pre-Test: {law.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                Get 5/5 correct to earn the gem
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Correct Answers</p>
            <p className="text-2xl font-orbitron font-bold text-gem">
              {correctAnswers}/5
            </p>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={cn(
              "p-6 md:p-8 bg-card/80 backdrop-blur-sm border-2 transition-all duration-300",
              lastAnswerCorrect === true && "border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]",
              lastAnswerCorrect === false && "border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-shake",
              lastAnswerCorrect === null && "border-primary/20"
            )}>
              <div className="mb-8">
                <MathDisplay className="text-2xl text-center">
                  {currentQuestion.question}
                </MathDisplay>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === currentQuestion.correctIndex;
                  const showFeedback = isAnswered;

                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={isAnswered}
                      className={cn(
                        "p-6 rounded-lg border-2 transition-all duration-300 text-left relative overflow-hidden",
                        !isAnswered && "border-border hover:border-primary hover:bg-primary/10",
                        showFeedback && isSelected && isCorrect && "border-green-500 bg-green-500/20",
                        showFeedback && isSelected && !isCorrect && "border-red-500 bg-red-500/20",
                        showFeedback && !isSelected && isCorrect && "border-green-500/50 bg-green-500/10",
                        showFeedback && !isSelected && !isCorrect && "opacity-50"
                      )}
                      whileHover={!isAnswered ? { scale: 1.02 } : {}}
                      whileTap={!isAnswered ? { scale: 0.98 } : {}}
                    >
                      {/* Correct/Incorrect overlay animation */}
                      {showFeedback && isSelected && (
                        <motion.div
                          className={cn(
                            "absolute inset-0 opacity-20",
                            isCorrect ? "bg-green-500" : "bg-red-500"
                          )}
                          initial={{ scale: 0, borderRadius: "100%" }}
                          animate={{ scale: 3, borderRadius: "0%" }}
                          transition={{ duration: 0.5 }}
                        />
                      )}
                      
                      <div className="flex items-center gap-3 relative z-10">
                        <div className={cn(
                          "w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all",
                          !isAnswered && "border-border",
                          showFeedback && isSelected && isCorrect && "border-green-500 bg-green-500 text-white",
                          showFeedback && isSelected && !isCorrect && "border-red-500 bg-red-500 text-white",
                          showFeedback && !isSelected && isCorrect && "border-green-500 text-green-500"
                        )}>
                          {showFeedback && isSelected ? (
                            isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <X className="w-5 h-5" />
                          ) : (
                            String.fromCharCode(65 + index)
                          )}
                        </div>
                        <MathDisplay className="text-lg flex-1">
                          {option}
                        </MathDisplay>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PreTest;

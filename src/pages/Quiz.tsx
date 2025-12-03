import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MathText } from '@/utils/mathRenderer';
import questionsData from '@/data/questions.json';
import { Shield, Swords, Skull, CheckCircle2, X } from 'lucide-react';
import { HintHelper } from '@/components/HintHelper';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { soundEffects } from '@/utils/soundEffects';
import exponentiaDark from '@/assets/exponentia-dark.png';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  lawTested: string;
}

export default function Quiz() {
  const { levelId } = useParams<{ levelId: 'easy' | 'medium' | 'hard' }>();
  const navigate = useNavigate();
  const quizLevels = useGameStore((state) => state.quizLevels);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ questionId: string; correct: boolean; lawTested: string }[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);

  const currentLevel = quizLevels.find(l => l.id === levelId);

  useEffect(() => {
    if (!levelId || !currentLevel?.unlocked) {
      navigate('/laws');
      return;
    }

    // Select 50 random questions from the pool of 150
    const allQuestions = questionsData[levelId] as Question[];
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 50);
    setQuestions(selected);
  }, [levelId, currentLevel, navigate]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (optionIndex: number) => {
    if (showFeedback) return;
    soundEffects.playClick();
    setSelectedAnswer(optionIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctIndex;
    setLastAnswerCorrect(isCorrect);
    setAnswers([
      ...answers,
      {
        questionId: currentQuestion.id,
        correct: isCorrect,
        lawTested: currentQuestion.lawTested,
      },
    ]);
    setShowFeedback(true);

    if (isCorrect) {
      soundEffects.playCorrect();
    } else {
      soundEffects.playIncorrect();
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setLastAnswerCorrect(null);
      } else {
        // Quiz complete - navigate to results
        const correctCount = [...answers, { questionId: currentQuestion.id, correct: isCorrect, lawTested: currentQuestion.lawTested }].filter(a => a.correct).length;
        const score = Math.round((correctCount / questions.length) * 100);
        const missedLaws = [...answers, { questionId: currentQuestion.id, correct: isCorrect, lawTested: currentQuestion.lawTested }]
          .filter(a => !a.correct)
          .map(a => a.lawTested);
        
        if (score >= 75) {
          soundEffects.playVictory();
        }
        
        navigate(`/quiz-result/${levelId}`, { 
          state: { 
            score, 
            correctCount, 
            totalQuestions: questions.length,
            missedLaws: Array.from(new Set(missedLaws))
          } 
        });
      }
    }, 1500);
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading battle...</p>
        </div>
      </div>
    );
  }

  const enemyNames = {
    easy: 'Shadow Nuller',
    medium: 'Void Nuller',
    hard: 'Chaos Nuller',
  };

  const lawHints: Record<string, string> = {
    'Product of Powers': 'When multiplying powers with the same base, add the exponents together.',
    'Quotient of Powers': 'When dividing powers with the same base, subtract the exponents.',
    'Power of a Power': 'When raising a power to another power, multiply the exponents.',
    'Zero Exponent Rule': 'Any non-zero number raised to the power of zero equals 1.',
    'Negative Exponent Rule': 'A negative exponent means take the reciprocal and make the exponent positive.',
    'Power of a Product': 'When raising a product to a power, distribute the exponent to each factor.',
    'Power of a Quotient': 'When raising a quotient to a power, distribute the exponent to both numerator and denominator.',
    'Identity Exponent Rule': 'Any number raised to the power of 1 remains itself.',
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.85)), url(${exponentiaDark})`
      }}
    >
      {/* Header */}
      <motion.div 
        className="border-b border-border/50 bg-card/50 backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Swords className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-xl font-orbitron font-bold text-foreground">
                  Battle: {currentLevel?.name} Level
                </h1>
                <p className="text-sm text-muted-foreground">
                  vs {enemyNames[levelId!]}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <motion.div 
                className="flex items-center gap-2"
                animate={lastAnswerCorrect === true ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Shield className="w-5 h-5 text-green-500" />
                <span className="font-bold text-green-500">{answers.filter(a => a.correct).length}</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2"
                animate={lastAnswerCorrect === false ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Skull className="w-5 h-5 text-red-500" />
                <span className="font-bold text-red-500">{answers.filter(a => !a.correct).length}</span>
              </motion.div>
            </div>
          </div>
          <div className="mt-3">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Question Area */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={cn(
              "p-6 bg-card/80 backdrop-blur-sm border-2 transition-all duration-300",
              lastAnswerCorrect === true && "border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]",
              lastAnswerCorrect === false && "border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-shake",
              lastAnswerCorrect === null && "border-primary/20"
            )}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  <MathText>{currentQuestion.question}</MathText>
                </h2>
                <p className="text-sm text-muted-foreground">
                  Law: {currentQuestion.lawTested}
                </p>
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === currentQuestion.correctIndex;
                  const showCorrect = showFeedback && isCorrect;
                  const showIncorrect = showFeedback && isSelected && !isCorrect;

                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showFeedback}
                      className={cn(
                        "w-full p-4 rounded-lg border-2 transition-all text-left relative overflow-hidden",
                        showCorrect && "bg-green-500/20 border-green-500 text-green-400 font-bold",
                        showIncorrect && "bg-red-500/20 border-red-500 text-red-400",
                        !showFeedback && isSelected && "bg-primary/20 border-primary text-primary",
                        !showFeedback && !isSelected && "bg-card border-border hover:border-primary/50 text-foreground"
                      )}
                      whileHover={!showFeedback ? { scale: 1.01 } : {}}
                      whileTap={!showFeedback ? { scale: 0.99 } : {}}
                    >
                      {/* Feedback overlay animation */}
                      {showFeedback && (showCorrect || showIncorrect) && (
                        <motion.div
                          className={cn(
                            "absolute inset-0 opacity-10",
                            showCorrect ? "bg-green-500" : "bg-red-500"
                          )}
                          initial={{ scale: 0, borderRadius: "100%" }}
                          animate={{ scale: 3, borderRadius: "0%" }}
                          transition={{ duration: 0.5 }}
                        />
                      )}
                      
                      <div className="flex items-center gap-3 relative z-10">
                        <span className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-full font-bold transition-all",
                          showCorrect && "bg-green-500 text-white",
                          showIncorrect && "bg-red-500 text-white",
                          !showFeedback && "bg-background/50"
                        )}>
                          {showFeedback && isSelected ? (
                            isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <X className="w-5 h-5" />
                          ) : showFeedback && isCorrect ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            String.fromCharCode(65 + index)
                          )}
                        </span>
                        <span className="flex-1">
                          <MathText>{option}</MathText>
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {!showFeedback && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                    className="w-full mt-6"
                    size="lg"
                  >
                    Submit Answer
                  </Button>
                </motion.div>
              )}

              {showFeedback && (
                <motion.div 
                  className={cn(
                    "mt-6 p-4 rounded-lg",
                    lastAnswerCorrect ? "bg-green-500/20 border border-green-500" : "bg-red-500/20 border border-red-500"
                  )}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="font-bold flex items-center gap-2">
                    {lastAnswerCorrect ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-green-400">Correct!</span>
                      </>
                    ) : (
                      <>
                        <X className="w-5 h-5 text-red-500" />
                        <span className="text-red-400">Incorrect</span>
                      </>
                    )}
                  </p>
                  {!lastAnswerCorrect && (
                    <p className="text-sm mt-1 text-muted-foreground">
                      The correct answer is: <MathText>{currentQuestion.options[currentQuestion.correctIndex]}</MathText>
                    </p>
                  )}
                </motion.div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Hint Helper */}
        <HintHelper
          hint={lawHints[currentQuestion.lawTested] || 'Remember the laws of exponents you learned!'}
          onHintUsed={() => setHintUsed(true)}
          hintAvailable={!hintUsed}
        />
      </div>
    </div>
  );
}

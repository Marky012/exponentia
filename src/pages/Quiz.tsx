import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MathText } from '@/utils/mathRenderer';
import questionsData from '@/data/questions.json';
import { Shield, Swords, Skull } from 'lucide-react';
import { HintHelper } from '@/components/HintHelper';
import trainingArena from '@/assets/training-arena.png';

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
    setSelectedAnswer(optionIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctIndex;
    setAnswers([
      ...answers,
      {
        questionId: currentQuestion.id,
        correct: isCorrect,
        lawTested: currentQuestion.lawTested,
      },
    ]);
    setShowFeedback(true);

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        // Quiz complete - navigate to results
        const correctCount = [...answers, { questionId: currentQuestion.id, correct: isCorrect, lawTested: currentQuestion.lawTested }].filter(a => a.correct).length;
        const score = Math.round((correctCount / questions.length) * 100);
        const missedLaws = [...answers, { questionId: currentQuestion.id, correct: isCorrect, lawTested: currentQuestion.lawTested }]
          .filter(a => !a.correct)
          .map(a => a.lawTested);
        
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
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)), url(${trainingArena})`
      }}
    >
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
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
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-success" />
                <span className="font-bold text-success">{answers.filter(a => a.correct).length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Skull className="w-5 h-5 text-enemy" />
                <span className="font-bold text-enemy">{answers.filter(a => !a.correct).length}</span>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-2 border-primary/20">
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
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showFeedback}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    showCorrect
                      ? 'bg-success/20 border-success text-success font-bold'
                      : showIncorrect
                      ? 'bg-destructive/20 border-destructive text-destructive'
                      : isSelected
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-card border-border hover:border-primary/50 text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-background/50 font-bold">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1">
                      <MathText>{option}</MathText>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {!showFeedback && (
            <Button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="w-full mt-6"
              size="lg"
            >
              Submit Answer
            </Button>
          )}

          {showFeedback && (
            <div className={`mt-6 p-4 rounded-lg ${
              selectedAnswer === currentQuestion.correctIndex
                ? 'bg-success/20 border border-success'
                : 'bg-destructive/20 border border-destructive'
            }`}>
              <p className="font-bold">
                {selectedAnswer === currentQuestion.correctIndex ? '✓ Correct!' : '✗ Incorrect'}
              </p>
              {selectedAnswer !== currentQuestion.correctIndex && (
                <p className="text-sm mt-1">
                  The correct answer is: <MathText>{currentQuestion.options[currentQuestion.correctIndex]}</MathText>
                </p>
              )}
            </div>
          )}
        </Card>

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

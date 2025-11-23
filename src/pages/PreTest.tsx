import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MathDisplay } from '@/utils/mathRenderer';
import { ArrowLeft, Trophy, XCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import questionsData from '@/data/questions.json';
import trainingArena from '@/assets/training-arena.png';

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

  useEffect(() => {
    if (!law || !lawId) {
      navigate('/laws');
      return;
    }

    // Load questions for this law from preTest section
    const preTestQuestions = (questionsData.preTest as Record<string, Question[]>)[lawId];
    if (preTestQuestions && preTestQuestions.length >= 5) {
      setQuestions(preTestQuestions.slice(0, 5));
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
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    
    const isCorrect = answerIndex === currentQuestion.correctIndex;
    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
      toast.success('Correct!');
    } else {
      toast.error('Incorrect');
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      } else {
        setTestCompleted(true);
        setShowResult(true);
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
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setCorrectAnswers(0);
    setShowResult(false);
    setIsAnswered(false);
    setTestCompleted(false);
  };

  if (showResult) {
    const passed = correctAnswers === 5;
    
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <Card className="max-w-2xl w-full p-8 bg-card/90 backdrop-blur-sm border-2 border-primary/20 text-center">
          <div className={cn(
            "w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center",
            passed ? "bg-gem/20 border-4 border-gem animate-pulseGlow" : "bg-destructive/20 border-4 border-destructive"
          )}>
            {passed ? (
              <Trophy className="w-10 h-10 text-gem" />
            ) : (
              <XCircle className="w-10 h-10 text-destructive" />
            )}
          </div>

          <h1 className="text-3xl font-orbitron font-bold mb-4">
            {passed ? 'Gem Earned!' : 'Not Quite There'}
          </h1>

          <p className="text-lg text-muted-foreground mb-6">
            You answered <span className="font-bold text-primary">{correctAnswers}/5</span> questions correctly
          </p>

          {passed ? (
            <div className="bg-gradient-to-r from-gem/10 to-gem/5 border border-gem/30 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-gem animate-pulse" />
                <p className="font-semibold text-gem">Perfect Score!</p>
                <Sparkles className="w-5 h-5 text-gem animate-pulse" />
              </div>
              <p className="text-sm text-muted-foreground">
                You've mastered the {law.name} and earned its gem!
              </p>
            </div>
          ) : (
            <div className="bg-muted/20 border border-border rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground">
                You need all 5 questions correct to earn the gem. Review the lesson and try again!
              </p>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            {!passed && (
              <Button onClick={handleRetry} variant="outline">
                Try Again
              </Button>
            )}
            <Button onClick={handleComplete}>
              {passed ? 'Continue' : 'Back to Laws'}
            </Button>
          </div>
        </Card>
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
        <div className="flex items-center justify-between mb-6">
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
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="p-6 md:p-8 bg-card/80 backdrop-blur-sm border-2 border-primary/20">
          <div className="mb-8">
            <MathDisplay className="text-2xl text-center">
              {currentQuestion.question}
            </MathDisplay>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctIndex;
              const showFeedback = isAnswered && isSelected;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={isAnswered}
                  className={cn(
                    "p-6 rounded-lg border-2 transition-all duration-300 text-left",
                    "hover:scale-105 active:scale-95",
                    !isAnswered && "border-border hover:border-primary hover:bg-primary/10",
                    showFeedback && isCorrect && "border-gem bg-gem/10 animate-pulseGlow",
                    showFeedback && !isCorrect && "border-destructive bg-destructive/10",
                    isAnswered && !isSelected && "opacity-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm",
                      !isAnswered && "border-border",
                      showFeedback && isCorrect && "border-gem bg-gem text-gem-foreground",
                      showFeedback && !isCorrect && "border-destructive bg-destructive text-destructive-foreground"
                    )}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <MathDisplay className="text-lg flex-1">
                      {option}
                    </MathDisplay>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PreTest;

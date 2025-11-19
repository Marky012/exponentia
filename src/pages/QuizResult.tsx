import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trophy, XCircle, TrendingUp, RefreshCcw, ArrowRight, Target } from 'lucide-react';

export default function QuizResult() {
  const { levelId } = useParams<{ levelId: 'easy' | 'medium' | 'hard' }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { completeQuizLevel, quizLevels } = useGameStore();

  const { score, correctCount, totalQuestions, missedLaws } = location.state || {};

  const passed = score >= 75;
  const currentLevel = quizLevels.find(l => l.id === levelId);

  useEffect(() => {
    if (!score || !levelId) {
      navigate('/laws');
      return;
    }

    // Update game store
    completeQuizLevel(levelId, score, missedLaws);
  }, [score, levelId, missedLaws, completeQuizLevel, navigate]);

  if (!score || !currentLevel) {
    return null;
  }

  const nextLevel = quizLevels.find(l => l.unlocked && !l.completed);
  const allCompleted = quizLevels.every(l => l.completed);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 bg-card/80 backdrop-blur-sm border-2 border-primary/20">
        {/* Result Header */}
        <div className="text-center mb-8">
          {passed ? (
            <>
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Trophy className="w-20 h-20 text-gem animate-float" />
                  <div className="absolute inset-0 bg-gem/20 rounded-full blur-xl animate-pulseGlow"></div>
                </div>
              </div>
              <h1 className="text-4xl font-orbitron font-bold text-success mb-2">
                Victory!
              </h1>
              <p className="text-lg text-muted-foreground">
                You defeated the {currentLevel.name} Level Nuller!
              </p>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <XCircle className="w-20 h-20 text-destructive" />
              </div>
              <h1 className="text-4xl font-orbitron font-bold text-destructive mb-2">
                Not Quite...
              </h1>
              <p className="text-lg text-muted-foreground">
                The Nuller remains. Study and try again!
              </p>
            </>
          )}
        </div>

        {/* Score Display */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="p-6 bg-background/50 text-center">
            <div className="text-5xl font-bold text-primary mb-2">{score}%</div>
            <p className="text-sm text-muted-foreground">Final Score</p>
          </Card>
          <Card className="p-6 bg-background/50 text-center">
            <div className="text-5xl font-bold text-foreground mb-2">
              {correctCount}/{totalQuestions}
            </div>
            <p className="text-sm text-muted-foreground">Correct Answers</p>
          </Card>
        </div>

        {/* Pass/Fail Threshold */}
        <Card className="p-4 bg-background/30 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Passing Score: 75%</span>
            </div>
            <div className={`font-bold ${passed ? 'text-success' : 'text-destructive'}`}>
              {passed ? '✓ PASSED' : '✗ FAILED'}
            </div>
          </div>
        </Card>

        {/* Missed Laws Breakdown */}
        {missedLaws.length > 0 && (
          <Card className="p-6 bg-warning/10 border-warning/30 mb-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-warning mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-foreground mb-2">Areas for Review:</h3>
                <ul className="space-y-1">
                  {Array.from(new Set(missedLaws as string[])).map((law, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-warning"></span>
                      {law}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {!passed && (
            <Button
              onClick={() => navigate(`/quiz/${levelId}`)}
              className="w-full"
              size="lg"
            >
              <RefreshCcw className="w-5 h-5 mr-2" />
              Retry {currentLevel.name} Level
            </Button>
          )}

          {passed && nextLevel && !allCompleted && (
            <Button
              onClick={() => navigate(`/quiz/${nextLevel.id}`)}
              className="w-full"
              size="lg"
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Continue to {nextLevel.name} Level
            </Button>
          )}

          {allCompleted && (
            <Button
              onClick={() => navigate('/victory')}
              className="w-full"
              size="lg"
            >
              <Trophy className="w-5 h-5 mr-2" />
              View Victory Ceremony
            </Button>
          )}

          <Button
            onClick={() => navigate('/laws')}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Return to Laws
          </Button>
        </div>

        {/* Attempt Counter */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Attempt #{currentLevel.attempts}
        </div>
      </Card>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trophy, XCircle, TrendingUp, RefreshCcw, ArrowRight, Target } from 'lucide-react';
import { SettingsMenu } from '@/components/SettingsMenu';
import exponentiaDark from '@/assets/exponentia-dark.png';
import { PASSING_SCORE } from '@/constants/gameConfig';

export default function QuizResult() {
  const { levelId } = useParams<{ levelId: 'easy' | 'medium' | 'hard' }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { completeQuizLevel, quizLevels, addPendingSyncResults } = useGameStore();

  const { score, correctCount, totalQuestions, missedLaws } = location.state || {};

  const passed = score >= PASSING_SCORE;
  const currentLevel = quizLevels.find(l => l.id === levelId);

  const savedRef = useRef(false);

  useEffect(() => {
    if (score == null || !levelId) {
      navigate('/quiz-arena');
      return;
    }

    if (!savedRef.current) {
      savedRef.current = true;
      completeQuizLevel(levelId, score, missedLaws);

      if (!navigator.onLine) {
        addPendingSyncResults({
          id: `${levelId}-${Date.now()}`,
          levelId,
          score,
          missedLaws: missedLaws || [],
          completedAt: new Date().toISOString(),
        });
      }
    }
  }, [score, levelId, missedLaws, completeQuizLevel, navigate, addPendingSyncResults]);

  if (score == null || !currentLevel) {
    return null;
  }

  const nextLevel = quizLevels.find(l => l.unlocked && !l.completed);
  const allCompleted = quizLevels.every(l => l.completed);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url(${exponentiaDark})` }}
    >
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
        <SettingsMenu />
      </div>
      <Card className="max-w-2xl w-full p-4 sm:p-6 md:p-8 bg-primary/15 backdrop-blur-sm border-2 border-primary/60 card-learning shadow-2xl">
        {/* Result Header */}
        <div className="text-center mb-8">
          {passed ? (
            <>
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Trophy className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 text-gem animate-float" style={{ filter: 'drop-shadow(0 0 8px hsl(45 95% 58% / 0.4)) drop-shadow(0 0 20px hsl(45 95% 58% / 0.2))' }} />
                  <div className="absolute inset-0 bg-gem/20 rounded-full blur-xl animate-pulse" />
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-orbitron font-bold text-glow-gold mb-2">
                Victory!
              </h1>
              <p className="text-lg text-muted-foreground break-words">
                You defeated the {currentLevel.name} Level Nuller!
              </p>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <XCircle className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 text-destructive" style={{ filter: 'drop-shadow(0 0 6px hsl(var(--destructive) / 0.3)) drop-shadow(0 0 16px hsl(var(--destructive) / 0.15))' }} />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-orbitron font-bold text-destructive mb-2">
                Not Quite...
              </h1>
              <p className="text-lg text-muted-foreground">
                The Nuller remains. Study and try again!
              </p>
            </>
          )}
        </div>

        {/* Score Display */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-8">
          <Card className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30 text-center card-glow-primary">
            <div className={`text-3xl sm:text-4xl md:text-5xl font-bold font-orbitron mb-2 ${passed ? 'text-glow-gold' : 'text-primary'}`}>{score}%</div>
            <p className="text-sm text-muted-foreground">Final Score</p>
          </Card>
          <Card className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-card/80 to-card/50 text-center card-hover-lift">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold font-orbitron text-foreground mb-2">
              {correctCount}/{totalQuestions}
            </div>
            <p className="text-sm text-muted-foreground">Correct Answers</p>
          </Card>
        </div>

        {/* Pass/Fail Threshold */}
        <Card className="p-4 bg-background/30 border border-border/30 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground min-w-0">Passing Score: {PASSING_SCORE}%</span>
            </div>
            <div className={`font-bold ${passed ? 'text-success' : 'text-destructive'}`}>
              {passed ? '✓ PASSED' : '✗ FAILED'}
            </div>
          </div>
        </Card>

        {/* Missed Laws Breakdown */}
        {missedLaws.length > 0 && (
          <Card className="p-6 bg-warning/10 border-warning/30 card-glow-danger mb-6">
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
              onClick={() => navigate('/hub')}
              className="w-full"
              size="lg"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Return to Kingdom
            </Button>
          )}

          <Button
            onClick={() => navigate('/quiz-arena')}
            variant="ghost"
            className="w-full bg-primary/15 border border-primary/60 hover:bg-primary/25 text-primary"
            size="lg"
          >
            Return to Battle Arena
          </Button>
        </div>

        {/* Attempt Counter */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Attempt #{currentLevel.attempts.length}
        </div>
      </Card>
    </div>
  );
}

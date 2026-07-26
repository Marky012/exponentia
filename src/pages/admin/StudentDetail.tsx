import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, TrendingUp, AlertTriangle, BookOpen, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useStudentStore } from '@/store/studentStore';

const GRADE_MAP: Record<string, { grade: string; label: string; color: string }> = {
  excellent: { grade: 'A', label: 'Excellent', color: 'text-emerald-400' },
  good: { grade: 'B', label: 'Good', color: 'text-primary' },
  needs_improvement: { grade: 'C', label: 'Needs Improvement', color: 'text-yellow-400' },
  needs_attention: { grade: 'F', label: 'Needs Attention', color: 'text-destructive' },
  not_assessed: { grade: 'N/A', label: 'Not Assessed', color: 'text-muted-foreground' },
};

function getPerformance(s: { quizLevels: any[]; needsAttention: boolean }) {
  const allScores = s.quizLevels.flatMap((l: any) => (Array.isArray(l.attempts) ? l.attempts.map((a: any) => a.score) : []));
  if (allScores.length === 0) return 'not_assessed';
  if (s.needsAttention) return 'needs_attention';
  const avg = Math.round(allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length);
  if (avg >= 90) return 'excellent';
  if (avg >= 75) return 'good';
  return 'needs_improvement';
}

export default function StudentDetail() {
  const { studentName } = useParams<{ studentName: string }>();
  const navigate = useNavigate();
  const getStudentByName = useStudentStore(s => s.getStudentByName);
  const student = getStudentByName(decodeURIComponent(studentName || ''));

  useEffect(() => {
    if (student) document.title = `${student.playerName} - Student Detail`;
  }, [student]);

  if (!student) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Student not found.</p>
        <Button variant="ghost" onClick={() => navigate('/admin/students')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Students
        </Button>
      </div>
    );
  }

  const performance = getPerformance(student);
  const gradeInfo = GRADE_MAP[performance];
  const allScores = student.quizLevels.flatMap(l => (Array.isArray(l.attempts) ? l.attempts.map(a => a.score) : []));
  const avgScore = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : null;
  const gems = student.laws.filter(l => l.gemEarned).length;
  const completedLevels = student.quizLevels.filter(l => l.completed).length;
  const totalAttempts = student.quizLevels.reduce((sum, l) => sum + (Array.isArray(l.attempts) ? l.attempts.length : 0), 0);

  const lawsMissed = Object.entries(student.lawMissedCount || {})
    .sort(([, a], [, b]) => b - a)
    .map(([law, count]) => ({ law, count }));

  const levels = ['easy', 'medium', 'hard'] as const;
  const difficultyColors: Record<string, string> = {
    easy: 'border-emerald-500/50',
    medium: 'border-amber-500/50',
    hard: 'border-rose-500/50',
  };
  const difficultyTextColors: Record<string, string> = {
    easy: 'text-emerald-400',
    medium: 'text-amber-400',
    hard: 'text-rose-400',
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/admin/students')}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Students
      </Button>

      <div>
        <h1 className="text-3xl font-orbitron font-bold">{student.playerName}'s Profile</h1>
        <p className="text-muted-foreground mt-1">
          Gender: {student.playerGender || 'Not specified'} · Imported: {new Date(student.importedAt).toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="!bg-background/40 backdrop-blur-md border-border/50">
          <CardContent className="p-4 text-center">
            <Trophy className="w-5 h-5 text-gem mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Gems</p>
            <p className="text-2xl font-orbitron font-bold text-gem">{gems}/8</p>
          </CardContent>
        </Card>
        <Card className="!bg-background/40 backdrop-blur-md border-border/50">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Average</p>
            <p className="text-2xl font-orbitron font-bold text-primary">{avgScore !== null ? `${avgScore}%` : 'N/A'}</p>
          </CardContent>
        </Card>
        <Card className="!bg-background/40 backdrop-blur-md border-border/50">
          <CardContent className="p-4 text-center">
            <BookOpen className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Levels</p>
            <p className="text-2xl font-orbitron font-bold">{completedLevels}/3</p>
          </CardContent>
        </Card>
        <Card className={`!bg-background/40 backdrop-blur-md border-border/50`}>
          <CardContent className="p-4 text-center">
            <Star className={`w-5 h-5 mx-auto mb-1 ${gradeInfo.color}`} />
            <p className="text-xs text-muted-foreground">Grade</p>
            <p className={`text-2xl font-orbitron font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</p>
            <p className={`text-xs ${gradeInfo.color}`}>{gradeInfo.label}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {levels.map(level => {
          const levelData = student.quizLevels.find(l => l.id === level);
          if (!levelData) return null;
          const config = DIFFICULTY_CONFIG[level];
          const attempts = Array.isArray(levelData.attempts) ? levelData.attempts : [];
          const levelAvg = levelData.averageScore ?? 0;
          const levelBest = attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0;
          const missedLaws = [...new Set(attempts.flatMap(a => a.missedLaws))];

          return (
            <Card key={level} className={`!bg-background/60 backdrop-blur-md border-2 ${difficultyColors[level]} ${levelData.completed ? 'card-glow-primary' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-sm font-medium ${difficultyTextColors[level]}`}>{config.label}</CardTitle>
                  {levelData.completed && <Star className="w-4 h-4 text-gem fill-gem" />}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Avg: <strong className="text-foreground">{levelAvg}%</strong></span>
                  <span>Best: <strong className="text-foreground">{levelBest}%</strong></span>
                  <span>Attempts: <strong className="text-foreground">{attempts.length}</strong></span>
                </div>
                <Progress value={levelAvg} className="h-2" />
                {attempts.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {attempts.map((a, i) => (
                      <span key={i} className={`text-xs px-1.5 py-0.5 rounded ${a.score >= 75 ? 'bg-emerald-500/15 text-emerald-500' : 'bg-destructive/15 text-destructive'}`}>
                        {a.score}%
                      </span>
                    ))}
                  </div>
                )}
                {missedLaws.length > 0 && (
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Missed laws:</p>
                    <div className="flex flex-wrap gap-1">
                      {missedLaws.map(law => (
                        <span key={law} className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">{law}</span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {lawsMissed.length > 0 && (
        <Card className="!bg-background/40 backdrop-blur-md border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Laws Missed (Most Frequent)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lawsMissed.slice(0, 5).map(({ law, count }) => (
                <div key={law} className="flex items-center justify-between">
                  <span className="text-sm">{law}</span>
                  <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">{count} times</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {student.needsAttention && (
        <Card className="!bg-destructive/5 backdrop-blur-md border-destructive/30">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-destructive">Needs Attention</p>
                <p className="text-sm text-muted-foreground">{student.attentionReason}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

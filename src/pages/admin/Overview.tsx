import { useMemo } from 'react';
import { Users, TrendingUp, AlertTriangle, Award, BookOpen, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStudentStore } from '@/store/studentStore';

export default function Overview() {
  const students = useStudentStore(s => s.students);

  const stats = useMemo(() => {
    if (students.length === 0) {
      return {
        total: 0, started: 0, completedAll: 0, avgScore: null,
        needingAttention: 0, mostMissedLaw: null, totalAttempts: 0,
        avgGems: 0,
      };
    }

    let totalScore = 0;
    let scoreCount = 0;
    let totalAttempts = 0;
    let needingAttention = 0;
    let completedAll = 0;
    let started = 0;
    const lawMisses: Record<string, number> = {};
    const lawNames: Record<string, string> = {};

    for (const s of students) {
      if (s.playerName) started++;

      let allLawsCompleted = true;
      for (const law of s.laws) {
        if (!law.completed) allLawsCompleted = false;
        if (!law.gemEarned) allLawsCompleted = false;
      }
      if (allLawsCompleted && s.laws.length > 0) completedAll++;
      if (s.needsAttention) needingAttention++;

      for (const level of s.quizLevels) {
        if (Array.isArray(level.attempts)) {
          for (const a of level.attempts) {
            totalScore += a.score;
            scoreCount++;
            totalAttempts++;
            for (const law of a.missedLaws) {
              lawMisses[law] = (lawMisses[law] || 0) + 1;
            }
          }
        }
      }

      for (const [law, count] of Object.entries(s.lawMissedCount || {})) {
        lawMisses[law] = (lawMisses[law] || 0) + count;
      }

      const gems = s.laws.filter(l => l.gemEarned).length;
      lawMisses['__gems__'] = (lawMisses['__gems__'] || 0) + gems;
    }

    const avgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : null;
    const avgGems = students.length > 0 ? Math.round(lawMisses['__gems__'] / students.length) : 0;
    delete lawMisses['__gems__'];

    let mostMissedLaw: string | null = null;
    let maxMisses = 0;
    for (const [law, count] of Object.entries(lawMisses)) {
      if (count > maxMisses) { maxMisses = count; mostMissedLaw = law; }
    }

    return { total: students.length, started, completedAll, avgScore, needingAttention, mostMissedLaw, totalAttempts, avgGems };
  }, [students]);

  const cards = [
    { title: 'Total Students', value: stats.total, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Average Score', value: stats.avgScore !== null ? `${stats.avgScore}%` : 'N/A', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Need Attention', value: stats.needingAttention, icon: AlertTriangle, color: stats.needingAttention > 0 ? 'text-destructive' : 'text-emerald-500', bg: stats.needingAttention > 0 ? 'bg-destructive/10' : 'bg-emerald-500/10' },
    { title: 'Avg Gems Earned', value: `${stats.avgGems}/8`, icon: Award, color: 'text-gem', bg: 'bg-gem/10' },
    { title: 'Completed All Laws', value: stats.completedAll, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Total Quiz Attempts', value: stats.totalAttempts, icon: BarChart3, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <Card key={card.title} className="!bg-background/40 backdrop-blur-md border-border/50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{card.title}</p>
                  <p className={`text-2xl font-orbitron font-bold mt-1 ${card.color}`}>{card.value}</p>
                </div>
                <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <card.icon className={`w-4.5 h-4.5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats.mostMissedLaw && (
        <Card className="!bg-background/40 backdrop-blur-md border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Most Missed Law
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-orbitron font-bold text-destructive">{stats.mostMissedLaw}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Consider reviewing this topic with students who need attention.
            </p>
          </CardContent>
        </Card>
      )}

      {students.length === 0 && (
        <Card className="!bg-background/40 backdrop-blur-md border-border/50 border-dashed">
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground font-medium">No students imported yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Go to Settings to import student data files.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

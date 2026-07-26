import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowUpDown, Eye, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useStudentStore } from '@/store/studentStore';
import { toast } from 'sonner';
import type { ImportedStudent } from '@/store/studentStore';

type FilterType = 'all' | 'struggling' | 'completed' | 'not_started';
type SortField = 'name' | 'score' | 'gems' | 'last_activity';

function getStatus(s: ImportedStudent): { label: string; color: string } {
  if (s.needsAttention) return { label: 'Needs Attention', color: 'bg-destructive/15 text-destructive' };
  const totalAttempts = s.quizLevels.reduce((sum, l) => sum + (Array.isArray(l.attempts) ? l.attempts.length : 0), 0);
  if (totalAttempts === 0) return { label: 'Not Started', color: 'bg-muted text-muted-foreground' };
  const allScores = s.quizLevels.flatMap(l => (Array.isArray(l.attempts) ? l.attempts.map(a => a.score) : []));
  const avg = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
  if (avg >= 90) return { label: 'Excellent', color: 'bg-emerald-500/15 text-emerald-500' };
  if (avg >= 75) return { label: 'Good', color: 'bg-blue-500/15 text-blue-500' };
  return { label: 'Needs Improvement', color: 'bg-yellow-500/15 text-yellow-500' };
}

function getAvgScore(s: ImportedStudent): number | null {
  const allScores = s.quizLevels.flatMap(l => (Array.isArray(l.attempts) ? l.attempts.map(a => a.score) : []));
  return allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : null;
}

function getGems(s: ImportedStudent): number {
  return s.laws.filter(l => l.gemEarned).length;
}

function getCompletedLevels(s: ImportedStudent): number {
  return s.quizLevels.filter(l => l.completed).length;
}

function getLastActivity(s: ImportedStudent): Date | null {
  let latest: Date | null = null;
  for (const level of s.quizLevels) {
    if (Array.isArray(level.attempts)) {
      for (const a of level.attempts) {
        const d = new Date(a.date);
        if (!latest || d > latest) latest = d;
      }
    }
  }
  return latest;
}

export default function StudentList() {
  const navigate = useNavigate();
  const { students, removeStudent } = useStudentStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...students];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => s.playerName.toLowerCase().includes(q));
    }

    switch (filter) {
      case 'struggling':
        list = list.filter(s => s.needsAttention);
        break;
      case 'completed':
        list = list.filter(s => s.laws.length > 0 && s.laws.every(l => l.gemEarned));
        break;
      case 'not_started':
        list = list.filter(s => s.quizLevels.every(l => l.attempts.length === 0));
        break;
    }

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name': cmp = a.playerName.localeCompare(b.playerName); break;
        case 'score': cmp = (getAvgScore(a) ?? -1) - (getAvgScore(b) ?? -1); break;
        case 'gems': cmp = getGems(a) - getGems(b); break;
        case 'last_activity': {
          const la = getLastActivity(a)?.getTime() ?? 0;
          const lb = getLastActivity(b)?.getTime() ?? 0;
          cmp = la - lb;
          break;
        }
      }
      return sortAsc ? cmp : -cmp;
    });

    return list;
  }, [students, search, filter, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const handleRemove = (name: string) => {
    removeStudent(name);
    setDeleteTarget(null);
    toast.success(`${name} removed`);
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <ArrowUpDown className={`w-3 h-3 ml-1 ${sortField === field ? 'text-primary' : 'text-muted-foreground/50'}`} />
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {([['all', 'All'], ['struggling', 'Struggling'], ['completed', 'Completed'], ['not_started', 'Not Started']] as const).map(([key, label]) => (
            <Button
              key={key}
              variant={filter === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(key)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {students.length === 0 ? (
        <Card className="!bg-background/40 backdrop-blur-md border-border/50 border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No students imported yet.</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Go to Settings to import student data.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-3 font-medium text-muted-foreground cursor-pointer select-none" onClick={() => handleSort('name')}>
                  <span className="flex items-center">Name <SortIcon field="name" /></span>
                </th>
                <th className="text-left py-3 px-3 font-medium text-muted-foreground hidden sm:table-cell">Gender</th>
                <th className="text-center py-3 px-3 font-medium text-muted-foreground cursor-pointer select-none" onClick={() => handleSort('gems')}>
                  <span className="flex items-center justify-center">Gems <SortIcon field="gems" /></span>
                </th>
                <th className="text-center py-3 px-3 font-medium text-muted-foreground cursor-pointer select-none hidden md:table-cell" onClick={() => handleSort('score')}>
                  <span className="flex items-center justify-center">Score <SortIcon field="score" /></span>
                </th>
                <th className="text-center py-3 px-3 font-medium text-muted-foreground hidden md:table-cell">Levels</th>
                <th className="text-center py-3 px-3 font-medium text-muted-foreground">Status</th>
                <th className="text-center py-3 px-3 font-medium text-muted-foreground cursor-pointer select-none hidden lg:table-cell" onClick={() => handleSort('last_activity')}>
                  <span className="flex items-center justify-center">Last Activity <SortIcon field="last_activity" /></span>
                </th>
                <th className="text-right py-3 px-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const status = getStatus(s);
                const score = getAvgScore(s);
                const gems = getGems(s);
                const levels = getCompletedLevels(s);
                const lastActivity = getLastActivity(s);
                return (
                  <tr key={s.playerName} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-3 font-medium">{s.playerName}</td>
                    <td className="py-3 px-3 text-muted-foreground capitalize hidden sm:table-cell">{s.playerGender || '—'}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-gem font-orbitron font-bold">{gems}</span>
                      <span className="text-muted-foreground">/8</span>
                    </td>
                    <td className="py-3 px-3 text-center hidden md:table-cell">
                      {score !== null ? `${score}%` : '—'}
                    </td>
                    <td className="py-3 px-3 text-center hidden md:table-cell">{levels}/3</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center text-muted-foreground text-xs hidden lg:table-cell">
                      {lastActivity ? lastActivity.toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/students/${encodeURIComponent(s.playerName)}`)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(s.playerName)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          Showing {filtered.length} of {students.length} students
        </p>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Student?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove "{deleteTarget}" from the list? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteTarget && handleRemove(deleteTarget)}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

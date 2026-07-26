import { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, Search, Download, Upload, Check, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { getQuestions, saveQuestions, type QuestionBankData } from '@/utils/questions';
import { LAW_ID_TO_PRETEST_KEY } from '@/constants/quizConfig';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Question } from '@/types/game';

const LAW_NAMES = [
  'Product of Powers', 'Quotient of Powers', 'Power of a Power',
  'Zero Exponent Rule', 'Negative Exponent Rule', 'Power of a Product',
  'Power of a Quotient', 'Identity Exponent Rule',
];

const PRETEST_KEYS = Object.values(LAW_ID_TO_PRETEST_KEY);

type DifficultyTab = 'easy' | 'medium' | 'hard' | 'preTest';

const TAB_LIST: { value: DifficultyTab; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'preTest', label: 'Pre-Test' },
];

function QuestionForm({ question, onSave, onCancel }: {
  question?: Question;
  onSave: (q: Question) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(question?.question || '');
  const [options, setOptions] = useState<string[]>(question?.options || ['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(question?.correctIndex ?? 0);
  const [lawTested, setLawTested] = useState(question?.lawTested || LAW_NAMES[0]);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) { setError('Question text is required'); return; }
    if (options.some(o => !o.trim())) { setError('All options must be filled'); return; }
    onSave({
      id: question?.id || `Q_${Date.now()}`,
      question: text.trim(),
      options: options.map(o => o.trim()),
      correctIndex,
      lawTested,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border/50">
      <div className="space-y-2">
        <Label>Question Text</Label>
        <Input value={text} onChange={e => { setText(e.target.value); setError(''); }} placeholder="e.g. Simplify: 2³ × 2²" />
      </div>
      <div className="space-y-2">
        <Label>Options (click letter to mark correct)</Label>
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCorrectIndex(i)}
              className={cn(
                "w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                correctIndex === i ? 'border-emerald-500 bg-emerald-500/20 text-emerald-500' : 'border-border text-muted-foreground'
              )}
            >
              {correctIndex === i ? <Check className="w-3.5 h-3.5" /> : String.fromCharCode(65 + i)}
            </button>
            <Input value={opt} onChange={e => { const n = [...options]; n[i] = e.target.value; setOptions(n); }} placeholder={`Option ${String.fromCharCode(65 + i)}`} />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Label>Law Tested</Label>
        <select
          value={lawTested}
          onChange={e => setLawTested(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
        >
          {LAW_NAMES.map(law => <option key={law} value={law}>{law}</option>)}
        </select>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm"><Check className="w-4 h-4 mr-1" /> Save</Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}><X className="w-4 h-4 mr-1" /> Cancel</Button>
      </div>
    </form>
  );
}

function PreTestQuestionForm({ question, onSave, onCancel }: {
  question?: Question;
  onSave: (q: Question) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(question?.question || '');
  const [options, setOptions] = useState<string[]>(question?.options || ['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(question?.correctIndex ?? 0);
  const [lawTested, setLawTested] = useState(question?.lawTested || LAW_NAMES[0]);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) { setError('Question text is required'); return; }
    if (options.some(o => !o.trim())) { setError('All options must be filled'); return; }
    onSave({
      id: question?.id || `PT_${Date.now()}`,
      question: text.trim(),
      options: options.map(o => o.trim()),
      correctIndex,
      lawTested,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border/50">
      <div className="space-y-2">
        <Label>Question Text</Label>
        <Input value={text} onChange={e => { setText(e.target.value); setError(''); }} placeholder="e.g. Simplify: 2³ × 2²" />
      </div>
      <div className="space-y-2">
        <Label>Options (click letter to mark correct)</Label>
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCorrectIndex(i)}
              className={cn(
                "w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                correctIndex === i ? 'border-emerald-500 bg-emerald-500/20 text-emerald-500' : 'border-border text-muted-foreground'
              )}
            >
              {correctIndex === i ? <Check className="w-3.5 h-3.5" /> : String.fromCharCode(65 + i)}
            </button>
            <Input value={opt} onChange={e => { const n = [...options]; n[i] = e.target.value; setOptions(n); }} placeholder={`Option ${String.fromCharCode(65 + i)}`} />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Label>Law Tested</Label>
        <select value={lawTested} onChange={e => setLawTested(e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm">
          {LAW_NAMES.map(law => <option key={law} value={law}>{law}</option>)}
        </select>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm"><Check className="w-4 h-4 mr-1" /> Save</Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}><X className="w-4 h-4 mr-1" /> Cancel</Button>
      </div>
    </form>
  );
}

export default function QuestionBank() {
  const [bank, setBank] = useState<QuestionBankData>(() => getQuestions());
  const [tab, setTab] = useState<DifficultyTab>('easy');
  const [search, setSearch] = useState('');
  const [lawFilter, setLawFilter] = useState<string>('all');
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Question Bank - Exponentia Admin';
  }, []);

  const getTabCount = (t: DifficultyTab) => {
    if (t === 'preTest') return PRETEST_KEYS.reduce((s, k) => s + ((bank.preTest as Record<string, Question[]>)[k]?.length || 0), 0);
    return (bank[t] || []).length;
  };

  const filtered = useMemo(() => {
    let list: Question[] = [];
    if (tab === 'preTest') {
      for (const key of PRETEST_KEYS) {
        const arr = (bank.preTest as Record<string, Question[]>)[key];
        if (Array.isArray(arr)) list = [...list, ...arr];
      }
    } else {
      list = [...(bank[tab] || [])];
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(item =>
        item.question.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.lawTested.toLowerCase().includes(q)
      );
    }
    if (lawFilter !== 'all') {
      list = list.filter(item => item.lawTested === lawFilter);
    }
    return list;
  }, [bank, tab, search, lawFilter]);

  const handleSave = (q: Question) => {
    const updated = { ...bank };
    if (tab === 'preTest') {
      const lawIdx = LAW_NAMES.indexOf(q.lawTested);
      const lawKey = lawIdx >= 0 ? PRETEST_KEYS[lawIdx % PRETEST_KEYS.length] : PRETEST_KEYS[0];
      const arr = [...((updated.preTest as Record<string, Question[]>)[lawKey] || [])];
      const idx = arr.findIndex(i => i.id === q.id);
      if (idx >= 0) arr[idx] = q; else arr.push(q);
      (updated.preTest as Record<string, Question[]>)[lawKey] = arr;
    } else {
      const arr = [...(updated[tab] || [])];
      const idx = arr.findIndex(i => i.id === q.id);
      if (idx >= 0) arr[idx] = q; else arr.push(q);
      updated[tab] = arr as any;
    }
    setBank(updated);
    saveQuestions(updated);
    setEditing(null);
    setAdding(false);
    toast.success('Question saved');
  };

  const handleDelete = (id: string) => {
    const updated = { ...bank };
    if (tab === 'preTest') {
      for (const key of PRETEST_KEYS) {
        const arr = (updated.preTest as Record<string, Question[]>)[key];
        if (arr) (updated.preTest as Record<string, Question[]>)[key] = arr.filter(q => q.id !== id);
      }
    } else {
      updated[tab] = (updated[tab] || []).filter((q: any) => q.id !== id) as any;
    }
    setBank(updated);
    saveQuestions(updated);
    setDeleteConfirm(null);
    toast.success('Question deleted');
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(bank, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exponentia-questions-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Question bank exported');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!data.easy || !data.medium || !data.hard || !data.preTest) {
          toast.error('Invalid question bank format (missing required sections)');
          return;
        }
        setBank(data);
        saveQuestions(data);
        toast.success('Question bank imported');
      } catch {
        toast.error('Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {getTabCount('easy') + getTabCount('medium') + getTabCount('hard')} quiz questions · {getTabCount('preTest')} pre-test questions
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
          <label>
            <Button variant="outline" size="sm" asChild>
              <span><Upload className="w-4 h-4 mr-1" /> Import</span>
            </Button>
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        {TAB_LIST.map(t => (
          <button
            key={t.value}
            onClick={() => { setTab(t.value); setEditing(null); setAdding(false); }}
            className={cn(
              "flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              tab === t.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label} ({getTabCount(t.value)})
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select
          value={lawFilter}
          onChange={e => setLawFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background text-sm"
        >
          <option value="all">All Laws</option>
          {LAW_NAMES.map(law => <option key={law} value={law}>{law}</option>)}
        </select>
      </div>

      <div className="flex justify-end">
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add Question
        </Button>
      </div>

      {adding && (
        <div className="mb-4">
          {tab === 'preTest' ? (
            <PreTestQuestionForm onSave={handleSave} onCancel={() => setAdding(false)} />
          ) : (
            <QuestionForm onSave={handleSave} onCancel={() => setAdding(false)} />
          )}
        </div>
      )}

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No questions found.</p>
        ) : (
          filtered.map(q => (
            <div key={q.id}>
              {editing === q.id ? (
                <div className="mb-3">
                  {tab === 'preTest' ? (
                    <PreTestQuestionForm question={q} onSave={handleSave} onCancel={() => setEditing(null)} />
                  ) : (
                    <QuestionForm question={q} onSave={handleSave} onCancel={() => setEditing(null)} />
                  )}
                </div>
              ) : (
                <Card className="bg-primary/10 border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{q.id}</span>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{q.lawTested}</span>
                        </div>
                        <p className="font-medium text-sm mb-2">{q.question}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                          {q.options.map((opt, i) => (
                            <div key={i} className={`text-xs px-2 py-1 rounded ${i === q.correctIndex ? 'bg-emerald-500/15 text-emerald-500 font-medium' : 'text-muted-foreground'}`}>
                              <span className="font-bold mr-1">{String.fromCharCode(65 + i)}.</span> {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(q.id)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(q.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ))
        )}
      </div>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Question</DialogTitle>
            <DialogDescription>Are you sure you want to delete this question? This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Trophy, BookOpen, Star, AlertTriangle, TrendingUp, FileText } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { DIFFICULTY_CONFIG } from '../constants/quizConfig';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import ExponentiaBackground from '../components/ExponentiaBackground';
import type { StudentReport as ReportType } from '../store/gameStore';

const GRADE_SCALE: Record<string, { grade: string; label: string; color: string }> = {
  excellent: { grade: 'A', label: 'Excellent', color: 'text-emerald-400' },
  good: { grade: 'B', label: 'Good', color: 'text-primary' },
  needs_improvement: { grade: 'C', label: 'Needs Improvement', color: 'text-yellow-400' },
  needs_attention: { grade: 'F', label: 'Needs Attention', color: 'text-destructive' },
  not_assessed: { grade: 'N/A', label: 'Not Assessed', color: 'text-muted-foreground' },
};

const LAW_NAMES: Record<string, string> = {
  'Product Rule': 'Product Rule',
  'Quotient Rule': 'Quotient Rule',
  'Power Rule': 'Power Rule',
  'Zero Exponent Rule': 'Zero Exponent Rule',
  'Negative Exponent Rule': 'Negative Exponent Rule',
  'Power of a Product Rule': 'Power of a Product Rule',
  'Power of a Quotient Rule': 'Power of a Quotient Rule',
  'Identity Rule': 'Identity Rule',
};

type DifficultyKey = 'easy' | 'medium' | 'hard';

function LevelCard({ title, icon, level, passed, accentClass }: {
  title: string;
  icon: React.ReactNode;
  level: ReportType['easyLevel'] | ReportType['mediumLevel'] | ReportType['hardLevel'];
  passed: boolean;
  accentClass: string;
}) {
  if (!level) {
    return (
      <Card className="border-2 border-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <span className={accentClass}>{icon}</span>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Not attempted</p>
        </CardContent>
      </Card>
    );
  }

  const avg = Math.round(level.averageScore);
  const best = level.scores.length > 0 ? Math.max(...level.scores) : 0;

  return (
    <Card className={`border-2 ${passed ? 'border-primary/50' : 'border-muted/50'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <span className={accentClass}>{icon}</span>
            {title}
          </CardTitle>
          {passed && <Star className="w-4 h-4 text-gem fill-gem" />}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Average: <strong className="text-foreground">{avg}%</strong></span>
          <span>Best: <strong className="text-foreground">{best}%</strong></span>
          <span>Attempts: <strong className="text-foreground">{level.attempts}</strong></span>
        </div>
        <div className="relative">
          <Progress value={avg} className="h-2.5" />
        </div>
        {level.missedLaws.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-1.5">Laws to review:</p>
            <div className="flex flex-wrap gap-1.5">
              {level.missedLaws.map(law => (
                <span key={law} className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                  {law}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function printReport(report: ReportType, playerName: string) {
  const gradeInfo = GRADE_SCALE[report.overallPerformance] || GRADE_SCALE.not_assessed;

  const buildLevelSection = (
    title: string,
    level: ReportType['easyLevel'] | ReportType['mediumLevel'] | ReportType['hardLevel'],
    passed: boolean
  ) => {
    if (!level) return `<div class="level-card"><h3>${title}</h3><p class="muted">Not attempted</p></div>`;
    const avg = Math.round(level.averageScore);
    const best = level.scores.length > 0 ? Math.max(...level.scores) : 0;
    const barColor = passed ? '#10b981' : '#ef4444';
    const status = passed
      ? '<span class="badge badge-pass">PASSED</span>'
      : '<span class="badge badge-fail">NOT PASSED</span>';

    const missed = level.missedLaws.length > 0
      ? `<div class="missed-laws">
          <p>Laws to review:</p>
          <div class="tags">${level.missedLaws.map(l => `<span class="tag">${l}</span>`).join('')}</div>
        </div>`
      : '';

    return `
      <div class="level-card ${passed ? 'passed' : ''}">
        <div class="level-header">
          <h3>${title}</h3>
          ${status}
        </div>
        <div class="score-bar-track">
          <div class="score-bar-fill" style="width: ${Math.min(avg, 100)}%; background: ${barColor}"></div>
        </div>
        <div class="score-row">
          <span>Average: <strong>${avg}%</strong></span>
          <span>Best: <strong>${best}%</strong></span>
          <span>Attempts: <strong>${level.attempts}</strong></span>
        </div>
        ${missed}
      </div>`;
  };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Student Report - ${playerName}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    color: #1e293b;
    background: #fff;
    padding: 40px;
    line-height: 1.5;
  }
  @media print { body { padding: 20px; } .no-print { display: none !important; } }
  .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #6366f1; }
  .header h1 { font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
  .header .subtitle { font-size: 13px; color: #64748b; }
  .overview { display: flex; gap: 16px; margin-bottom: 30px; }
  .overview-card { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; text-align: center; }
  .overview-card .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; margin-bottom: 4px; }
  .overview-card .value { font-size: 28px; font-weight: 700; }
  .overview-card .sub { font-size: 12px; color: #64748b; margin-top: 2px; }
  .section-title { font-size: 15px; font-weight: 600; color: #334155; margin-bottom: 14px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }
  .levels { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 30px; }
  .level-card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; }
  .level-card.passed { border-color: #10b981; background: #f0fdf4; }
  .level-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .level-header h3 { font-size: 14px; font-weight: 600; color: #1e293b; }
  .badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px; }
  .badge-pass { background: #dcfce7; color: #16a34a; }
  .badge-fail { background: #fee2e2; color: #dc2626; }
  .score-bar-track { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin-bottom: 10px; }
  .score-bar-fill { height: 100%; border-radius: 4px; }
  .score-row { display: flex; justify-content: space-between; font-size: 12px; color: #64748b; }
  .score-row strong { color: #1e293b; }
  .missed-laws { margin-top: 10px; padding-top: 10px; border-top: 1px solid #e2e8f0; }
  .missed-laws p { font-size: 11px; color: #94a3b8; margin-bottom: 6px; }
  .tags { display: flex; flex-wrap: wrap; gap: 4px; }
  .tag { font-size: 10px; background: #fef2f2; color: #dc2626; padding: 2px 8px; border-radius: 999px; }
  .muted { color: #94a3b8; font-size: 13px; text-align: center; padding: 20px 0; }
  .recommendations { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 30px; }
  .recommendations ul { list-style: none; padding: 0; }
  .recommendations li { font-size: 13px; color: #475569; padding: 6px 0; padding-left: 18px; position: relative; }
  .recommendations li::before { content: "\\2022"; color: #6366f1; position: absolute; left: 0; font-weight: 700; }
  .footer { text-align: center; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; }
  .no-print { margin-top: 20px; text-align: center; }
  .no-print button { padding: 10px 28px; background: #6366f1; color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; font-weight: 600; }
</style>
</head>
<body>
  <div class="header">
    <h1>Law of Exponents - Student Report</h1>
    <p class="subtitle">${playerName} | Generated ${new Date().toLocaleDateString()}</p>
  </div>
  <div class="overview">
    <div class="overview-card">
      <div class="label">Overall Grade</div>
      <div class="value" style="color: ${report.overallPerformance === 'excellent' ? '#16a34a' : report.overallPerformance === 'good' ? '#2563eb' : '#dc2626'}">${gradeInfo.grade}</div>
      <div class="sub">${gradeInfo.label}</div>
    </div>
    <div class="overview-card">
      <div class="label">Average Score</div>
      <div class="value" style="color: #6366f1">${report.averageScore !== null ? report.averageScore + '%' : 'N/A'}</div>
      <div class="sub">Across ${report.totalAttempts} attempt${report.totalAttempts !== 1 ? 's' : ''}</div>
    </div>
    <div class="overview-card">
      <div class="label">Levels Completed</div>
      <div class="value" style="color: ${report.completedLevels === 3 ? '#16a34a' : '#f59e0b'}">${report.completedLevels}/3</div>
      <div class="sub">${report.completedLevels === 3 ? 'All levels done' : 'In progress'}</div>
    </div>
  </div>
  <div class="section-title">Level Breakdown</div>
  <div class="levels">
    ${buildLevelSection('Easy', report.easyLevel, report.easyLevel?.passed ?? false)}
    ${buildLevelSection('Medium', report.mediumLevel, report.mediumLevel?.passed ?? false)}
    ${buildLevelSection('Hard', report.hardLevel, report.hardLevel?.passed ?? false)}
  </div>
  ${report.lawsToFocus.length > 0 ? `
  <div class="section-title">Laws to Focus On</div>
  <div class="recommendations">
    <div class="tags" style="gap: 6px">
      ${report.lawsToFocus.map(l => `<span class="tag" style="font-size: 12px; padding: 4px 12px">${l}</span>`).join('')}
    </div>
  </div>` : ''}
  ${report.recommendations.length > 0 ? `
  <div class="section-title">Recommendations</div>
  <div class="recommendations">
    <ul>${report.recommendations.map(r => `<li>${r}</li>`).join('')}</ul>
  </div>` : ''}
  <div class="footer">
    <p>Generated by Exponentia - Law of Exponents Learning Platform</p>
  </div>
  <div class="no-print">
    <button onclick="window.print()">Print Report</button>
  </div>
</body>
</html>`;

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

export default function StudentReport() {
  const navigate = useNavigate();
  const [report] = useState<ReportType>(() => useGameStore.getState().getStudentReport());
  const { playerName } = report;
  const [downloading, setDownloading] = useState(false);
  const [showDownloadSuccess, setShowDownloadSuccess] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    document.title = `Student Report - ${playerName || 'Student'}`;
  }, [playerName]);

  const gradeInfo = GRADE_SCALE[report.overallPerformance] || GRADE_SCALE.not_assessed;

  const handlePrintClick = () => {
    setFullName('');
    setNameError('');
    setShowNameModal(true);
  };

  const handleConfirmPrint = async () => {
    if (!fullName.trim()) {
      setNameError('Please enter the student\'s full name');
      return;
    }
    setShowNameModal(false);
    setDownloading(true);
    setShowDownloadSuccess(false);
    try {
      printReport(report, fullName.trim());
      await new Promise(resolve => setTimeout(resolve, 800));
      setShowDownloadSuccess(true);
      setTimeout(() => setShowDownloadSuccess(false), 2000);
    } finally {
      setDownloading(false);
    }
  };

  const levels: Array<{ key: DifficultyKey; title: string; level: ReportType['easyLevel'] | ReportType['mediumLevel'] | ReportType['hardLevel']; accent: string; borderClass: string }> = [
    { key: 'easy', title: DIFFICULTY_CONFIG.easy.label, level: report.easyLevel, accent: 'text-emerald-400', borderClass: 'border-emerald-500/50' },
    { key: 'medium', title: DIFFICULTY_CONFIG.medium.label, level: report.mediumLevel, accent: 'text-amber-400', borderClass: 'border-amber-500/50' },
    { key: 'hard', title: DIFFICULTY_CONFIG.hard.label, level: report.hardLevel, accent: 'text-rose-400', borderClass: 'border-rose-500/50' },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      {/* Background */}
      <ExponentiaBackground overlayOpacity={0.5} />

      {/* Full Name Modal */}
      <Dialog open={showNameModal} onOpenChange={setShowNameModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-orbitron">Student Full Name</DialogTitle>
            <DialogDescription>
              Enter the student's full name to be displayed on the printed report.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setNameError(''); }}
              placeholder="e.g. Juan Dela Cruz"
              className="text-base"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmPrint(); }}
            />
            {nameError && <p className="text-sm text-destructive">{nameError}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowNameModal(false)}>Cancel</Button>
            <Button onClick={handleConfirmPrint}>
              <Download className="w-4 h-4 mr-1" /> Print Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/statistics')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Statistics
          </Button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-orbitron font-black mb-2 text-glow">
                {playerName}'s Report
              </h1>
              <p className="text-muted-foreground text-lg">
                Detailed performance breakdown
              </p>
            </div>
            <Button onClick={handlePrintClick} disabled={downloading} className="gap-2">
              {downloading ? (
                <motion.div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              {downloading ? 'Printing...' : 'Print Report'}
            </Button>
          </div>
        </motion.div>

        {/* Download success toast */}
        <motion.div
          initial={false}
          animate={showDownloadSuccess ? { y: 0, opacity: 1 } : { y: -40, opacity: 0 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100]"
        >
          {showDownloadSuccess && (
            <div className="bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium">
              <FileText className="w-4 h-4" /> Print dialog opened
            </div>
          )}
        </motion.div>

        {/* Grade Overview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-2 border-primary/50 mb-8">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Overall Grade</p>
                  <div className={`text-6xl font-orbitron font-black ${gradeInfo.color}`}>
                    {gradeInfo.grade}
                  </div>
                  <p className={`text-sm font-semibold mt-1 ${gradeInfo.color}`}>{gradeInfo.label}</p>
                </div>
                <div className="hidden md:block h-16 w-px bg-border" />
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Average</p>
                    <p className="text-2xl font-bold text-gem">
                      {report.averageScore !== null ? `${report.averageScore}%` : 'N/A'}
                    </p>
                  </div>
                  <div className="text-center">
                    <BookOpen className="w-5 h-5 text-accent mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Attempts</p>
                    <p className="text-2xl font-bold text-foreground">{report.totalAttempts}</p>
                  </div>
                  <div className="text-center">
                    <Star className="w-5 h-5 text-gem mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Completed</p>
                    <p className="text-2xl font-bold text-foreground">{report.completedLevels}/3</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 max-w-md mx-auto">
                <Progress value={report.averageScore ?? 0} className="h-3" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Level Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-orbitron font-bold mb-4 text-glow flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Level Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {levels.map(({ key, title, level, accent, borderClass }) => {
              const icons: Record<DifficultyKey, React.ReactNode> = {
                easy: <Star className="w-4 h-4" />,
                medium: <TrendingUp className="w-4 h-4" />,
                hard: <AlertTriangle className="w-4 h-4" />,
              };
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + levels.findIndex(l => l.key === key) * 0.1 }}
                >
                  <LevelCard
                    title={title}
                    icon={icons[key]}
                    level={level}
                    passed={level?.passed ?? false}
                    accentClass={accent}
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Laws to Focus */}
        {report.lawsToFocus.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-orbitron font-bold mb-4 text-glow">Laws to Focus On</h2>
            <Card className="border-2 border-destructive/30">
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  {report.lawsToFocus.map(law => (
                    <span key={law} className="text-sm bg-destructive/10 text-destructive border border-destructive/20 px-3 py-1 rounded-full font-medium">
                      {LAW_NAMES[law] || law}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recommendations */}
        {report.recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-2xl font-orbitron font-bold mb-4 text-glow">Recommendations</h2>
            <Card className="border-2 border-primary/30">
              <CardContent className="pt-6 space-y-3">
                {report.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="text-primary font-bold mt-0.5">{'>'}</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
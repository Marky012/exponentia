import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Trophy, BookOpen, Star, AlertTriangle, TrendingUp } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { DIFFICULTY_CONFIG } from '../constants/quizConfig';
import { Button } from '../components/ui/button';
import type { StudentReport as ReportType } from '../store/gameStore';

const GRADE_SCALE: Record<string, { grade: string; label: string }> = {
  excellent: { grade: 'A', label: 'Excellent' },
  good: { grade: 'B', label: 'Good' },
  needs_improvement: { grade: 'C', label: 'Needs Improvement' },
  needs_attention: { grade: 'F', label: 'Needs Attention' },
  not_assessed: { grade: 'N/A', label: 'Not Assessed' },
};

const PERFORMANCE_COLORS: Record<string, string> = {
  excellent: 'text-emerald-400',
  good: 'text-blue-400',
  needs_improvement: 'text-yellow-400',
  needs_attention: 'text-red-400',
  not_assessed: 'text-gray-400',
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

function ScoreBar({ score, passed }: { score: number; passed: boolean }) {
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">Score</span>
        <span className={passed ? 'text-emerald-400' : 'text-red-400'}>{score}%</span>
      </div>
      <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(score, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${passed ? 'bg-emerald-500' : 'bg-red-500'}`}
        />
      </div>
    </div>
  );
}

function LevelCard({ title, icon, level, passed, accentClass }: {
  title: string;
  icon: React.ReactNode;
  level: ReportType['easyLevel'] | ReportType['mediumLevel'] | ReportType['hardLevel'];
  passed: boolean;
  accentClass: string;
}) {
  if (!level) {
    return (
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 text-center">
        <div className={`${accentClass} mb-2 flex justify-center`}>{icon}</div>
        <h3 className="font-display text-white mb-1">{title}</h3>
        <p className="text-slate-500 text-sm">Not attempted</p>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800/40 border rounded-xl p-5 ${passed ? 'border-emerald-500/30' : 'border-slate-700/50'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={accentClass}>{icon}</div>
          <h3 className="font-display text-white">{title}</h3>
        </div>
        {passed && <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />}
      </div>
      <div className="space-y-3">
        <ScoreBar score={Math.round(level.averageScore)} passed={passed} />
        <div className="flex justify-between text-xs text-slate-400">
          <span>Attempts: {level.attempts}</span>
          <span>Best: {Math.max(...level.scores)}%</span>
        </div>
      </div>
      {level.missedLaws.length > 0 && (
        <div className="mt-3 border-t border-slate-700/50 pt-3">
          <p className="text-xs text-slate-500 mb-1">Laws to review:</p>
          <div className="flex flex-wrap gap-1">
            {level.missedLaws.map(law => (
              <span key={law} className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">
                {law}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function printReport(report: ReportType, playerName: string) {
  const gradeInfo = GRADE_SCALE[report.overallPerformance] || GRADE_SCALE.not_assessed;
  const totalCorrect = report.easyLevel && report.mediumLevel && report.hardLevel
    ? report.easyLevel.scores.reduce((a, b) => a + b, 0) +
      report.mediumLevel.scores.reduce((a, b) => a + b, 0) +
      report.hardLevel.scores.reduce((a, b) => a + b, 0)
    : 0;

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
  @media print {
    body { padding: 20px; }
    .no-print { display: none !important; }
  }
  .header {
    text-align: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 3px solid #6366f1;
  }
  .header h1 {
    font-size: 22px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 4px;
  }
  .header .subtitle {
    font-size: 13px;
    color: #64748b;
  }
  .overview {
    display: flex;
    gap: 16px;
    margin-bottom: 30px;
  }
  .overview-card {
    flex: 1;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 16px;
    text-align: center;
  }
  .overview-card .label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #94a3b8;
    margin-bottom: 4px;
  }
  .overview-card .value {
    font-size: 28px;
    font-weight: 700;
  }
  .overview-card .sub {
    font-size: 12px;
    color: #64748b;
    margin-top: 2px;
  }
  .section-title {
    font-size: 15px;
    font-weight: 600;
    color: #334155;
    margin-bottom: 14px;
    padding-bottom: 6px;
    border-bottom: 1px solid #e2e8f0;
  }
  .levels {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
    margin-bottom: 30px;
  }
  .level-card {
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 16px;
  }
  .level-card.passed {
    border-color: #10b981;
    background: #f0fdf4;
  }
  .level-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .level-header h3 {
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
  }
  .badge {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 999px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .badge-pass { background: #dcfce7; color: #16a34a; }
  .badge-fail { background: #fee2e2; color: #dc2626; }
  .score-bar-track {
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 10px;
  }
  .score-bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.8s ease;
  }
  .score-row {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #64748b;
  }
  .score-row strong { color: #1e293b; }
  .missed-laws {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #e2e8f0;
  }
  .missed-laws p { font-size: 11px; color: #94a3b8; margin-bottom: 6px; }
  .tags { display: flex; flex-wrap: wrap; gap: 4px; }
  .tag {
    font-size: 10px;
    background: #fef2f2;
    color: #dc2626;
    padding: 2px 8px;
    border-radius: 999px;
  }
  .muted { color: #94a3b8; font-size: 13px; text-align: center; padding: 20px 0; }
  .recommendations {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 30px;
  }
  .recommendations ul {
    list-style: none;
    padding: 0;
  }
  .recommendations li {
    font-size: 13px;
    color: #475569;
    padding: 6px 0;
    padding-left: 18px;
    position: relative;
  }
  .recommendations li::before {
    content: "\\2022";
    color: #6366f1;
    position: absolute;
    left: 0;
    font-weight: 700;
  }
  .footer {
    text-align: center;
    padding-top: 16px;
    border-top: 1px solid #e2e8f0;
    font-size: 11px;
    color: #94a3b8;
  }
  .no-print {
    margin-top: 20px;
    text-align: center;
  }
  .no-print button {
    padding: 10px 28px;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    font-weight: 600;
  }
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
    <ul>
      ${report.recommendations.map(r => `<li>${r}</li>`).join('')}
    </ul>
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
  const [report, setReport] = useState<ReportType>(() => useGameStore.getState().getStudentReport());
  const { playerName } = report;
  const [downloading, setDownloading] = useState(false);
  const [showDownloadSuccess, setShowDownloadSuccess] = useState(false);

  useEffect(() => {
    document.title = `Student Report - ${playerName || 'Student'}`;
  }, [playerName]);

  const gradeInfo = GRADE_SCALE[report.overallPerformance] || GRADE_SCALE.not_assessed;
  const perfColor = PERFORMANCE_COLORS[report.overallPerformance] || 'text-gray-400';

  const handlePrint = async () => {
    setDownloading(true);
    setShowDownloadSuccess(false);
    try {
      printReport(report, playerName);
      await new Promise(resolve => setTimeout(resolve, 800));
      setShowDownloadSuccess(true);
      setTimeout(() => setShowDownloadSuccess(false), 2000);
    } finally {
      setDownloading(false);
    }
  };

  const levels: Array<{ key: DifficultyKey; title: string; level: ReportType['easyLevel'] | ReportType['mediumLevel'] | ReportType['hardLevel']; accent: string }> = [
    { key: 'easy', title: DIFFICULTY_CONFIG.easy.label, level: report.easyLevel, accent: 'text-emerald-400' },
    { key: 'medium', title: DIFFICULTY_CONFIG.medium.label, level: report.mediumLevel, accent: 'text-amber-400' },
    { key: 'hard', title: DIFFICULTY_CONFIG.hard.label, level: report.hardLevel, accent: 'text-rose-400' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-white gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <h1 className="font-display text-lg">Student Report</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrint}
            disabled={downloading}
            className="text-indigo-400 hover:text-indigo-300 gap-1"
          >
            {downloading ? (
              <motion.div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {downloading ? 'Printing...' : 'Print'}
          </Button>
        </div>
      </div>

      {/* Download success toast */}
      <motion.div
        initial={false}
        animate={showDownloadSuccess ? { y: 0, opacity: 1 } : { y: -40, opacity: 0 }}
        className="fixed top-16 left-1/2 -translate-x-1/2 z-[100]"
      >
        {showDownloadSuccess && (
          <div className="bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium">
            <Download className="w-4 h-4" /> Print dialog opened
          </div>
        )}
      </motion.div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Student & Grade */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 text-center"
        >
          <p className="text-sm text-slate-500 uppercase tracking-widest mb-1">Student</p>
          <h2 className="font-display text-3xl text-white mb-4">{playerName || 'Unknown'}</h2>
          <div className="inline-flex items-center gap-3 bg-slate-900/50 rounded-full px-6 py-3 border border-slate-700/30">
            <Trophy className={`w-6 h-6 ${perfColor}`} />
            <span className={`text-2xl font-bold ${perfColor}`}>{gradeInfo.grade}</span>
            <span className="text-slate-400">|</span>
            <span className={`font-semibold ${perfColor}`}>{gradeInfo.label}</span>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4"
        >
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 text-center">
            <TrendingUp className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
            <p className="text-xs text-slate-500 uppercase tracking-wider">Average</p>
            <p className="font-display text-2xl text-white">
              {report.averageScore !== null ? `${report.averageScore}%` : 'N/A'}
            </p>
          </div>
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 text-center">
            <BookOpen className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-xs text-slate-500 uppercase tracking-wider">Attempts</p>
            <p className="font-display text-2xl text-white">{report.totalAttempts}</p>
          </div>
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 text-center">
            <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <p className="text-xs text-slate-500 uppercase tracking-wider">Completed</p>
            <p className="font-display text-2xl text-white">{report.completedLevels}/3</p>
          </div>
        </motion.div>

        {/* Level Reports */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-display text-white mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" /> Level Breakdown
          </h3>
          <div className="grid gap-4">
            {levels.map(({ key, title, level, accent }) => {
              const icons: Record<DifficultyKey, React.ReactNode> = {
                easy: <Star className="w-5 h-5" />,
                medium: <TrendingUp className="w-5 h-5" />,
                hard: <AlertTriangle className="w-5 h-5" />,
              };
              return (
                <LevelCard
                  key={key}
                  title={title}
                  icon={icons[key]}
                  level={level}
                  passed={level?.passed ?? false}
                  accentClass={accent}
                />
              );
            })}
          </div>
        </motion.div>

        {/* Laws to Focus */}
        {report.lawsToFocus.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="font-display text-white mb-3">Laws to Focus On</h3>
            <div className="flex flex-wrap gap-2">
              {report.lawsToFocus.map(law => (
                <span key={law} className="text-sm bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full">
                  {LAW_NAMES[law] || law}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recommendations */}
        {report.recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="font-display text-white mb-3">Recommendations</h3>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 space-y-2">
              {report.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-indigo-400 mt-0.5">{'>'}</span>
                  {rec}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
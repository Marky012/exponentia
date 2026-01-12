import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore, StudentReport as StudentReportType } from '@/store/gameStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  BookOpen,
  Trophy,
  Target,
  TrendingUp,
  Star,
  HelpCircle
} from 'lucide-react';
import ExponentiaBackground from '@/components/ExponentiaBackground';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const StudentReportPage = () => {
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  const { getStudentReport, playerName, needsAttention } = useGameStore();
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [fullName, setFullName] = useState('');
  
  const report: StudentReportType = getStudentReport();

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'needs_improvement': return 'text-yellow-500';
      case 'needs_attention': return 'text-red-500';
      case 'not_assessed': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getPerformanceIcon = (performance: string) => {
    switch (performance) {
      case 'excellent': return <Trophy className="w-8 h-8 text-green-500" />;
      case 'good': return <CheckCircle className="w-8 h-8 text-blue-500" />;
      case 'needs_improvement': return <Target className="w-8 h-8 text-yellow-500" />;
      case 'needs_attention': return <AlertTriangle className="w-8 h-8 text-red-500" />;
      case 'not_assessed': return <HelpCircle className="w-8 h-8 text-muted-foreground" />;
      default: return null;
    }
  };

  const getPerformanceLabel = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'Excellent Performance';
      case 'good': return 'Good Performance';
      case 'needs_improvement': return 'Needs Improvement';
      case 'needs_attention': return 'Needs Immediate Attention';
      case 'not_assessed': return 'Not Yet Assessed';
      default: return 'Not Assessed';
    }
  };

  const handleDownloadClick = () => {
    setShowNameDialog(true);
  };

  const handleDownloadPDF = () => {
    const nameToUse = fullName.trim() || report.playerName || 'Student';
    
    // Create printable content with proper left alignment
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student Report - ${nameToUse}</title>
          <style>
            @media print {
              @page { margin: 20mm; }
            }
            * { box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              padding: 40px; 
              max-width: 800px; 
              margin: 0 auto; 
              text-align: left;
            }
            h1 { color: #333; border-bottom: 2px solid #6366f1; padding-bottom: 10px; text-align: center; }
            h2 { color: #4f46e5; margin-top: 30px; text-align: left; }
            h3 { text-align: left; }
            p { text-align: left; margin: 8px 0; }
            ul { text-align: left; padding-left: 20px; }
            li { text-align: left; margin: 5px 0; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; text-align: left; }
            .level-card { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 8px; text-align: left; }
            .passed { border-left: 4px solid #22c55e; }
            .failed { border-left: 4px solid #ef4444; }
            .alert { background: #fef2f2; border: 1px solid #ef4444; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left; }
            .recommendation { background: #f0f9ff; padding: 10px; margin: 5px 0; border-radius: 4px; text-align: left; }
            .stat { display: inline-block; margin: 10px 20px 10px 0; text-align: left; }
            .stat-value { font-size: 24px; font-weight: bold; color: #4f46e5; }
            .stat-label { font-size: 12px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f5f5f5; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>EXPONENTIA - Student Performance Report</h1>
            <p style="text-align: center;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
          
          <div class="section">
            <h2>Student Information</h2>
            <p><strong>Name:</strong> ${nameToUse}</p>
            <p><strong>Overall Performance:</strong> ${getPerformanceLabel(report.overallPerformance)}</p>
            <p><strong>Levels Completed:</strong> ${report.completedLevels}/3</p>
            <p><strong>Average Score:</strong> ${report.averageScore !== null ? report.averageScore + '%' : 'N/A'}</p>
          </div>

          ${needsAttention ? `
          <div class="alert">
            <h3>ATTENTION REQUIRED</h3>
            <p>This student requires additional support and guidance. The student has struggled to meet the passing threshold after multiple attempts.</p>
            <p><strong>Observations:</strong></p>
            <ul>
              <li>Student may have difficulty understanding fundamental exponential concepts</li>
              <li>Additional one-on-one instruction is recommended</li>
              <li>Consider reviewing prerequisite mathematical skills</li>
            </ul>
          </div>
          ` : ''}

          <h2>Quiz Performance by Level</h2>
          
          ${report.easyLevel ? `
          <div class="level-card ${report.easyLevel.passed ? 'passed' : 'failed'}">
            <h3>Easy Level - ${report.easyLevel.passed ? 'PASSED' : 'NOT PASSED'}</h3>
            <table>
              <tr><td><strong>Attempts:</strong></td><td>${report.easyLevel.attempts}</td></tr>
              <tr><td><strong>Average Score:</strong></td><td>${report.easyLevel.averageScore}%</td></tr>
              <tr><td><strong>Individual Scores:</strong></td><td>${report.easyLevel.scores.map(s => s + '%').join(', ')}</td></tr>
              <tr><td><strong>Correct Answers (Best):</strong></td><td>${Math.round((Math.max(...report.easyLevel.scores) / 100) * 50)}/50</td></tr>
              <tr><td><strong>Mistakes (Best):</strong></td><td>${50 - Math.round((Math.max(...report.easyLevel.scores) / 100) * 50)}/50</td></tr>
            </table>
            ${report.easyLevel.missedLaws.length > 0 ? `<p><strong>Laws Missed:</strong> ${report.easyLevel.missedLaws.join(', ')}</p>` : ''}
          </div>
          ` : '<p>Easy level not attempted</p>'}

          ${report.mediumLevel ? `
          <div class="level-card ${report.mediumLevel.passed ? 'passed' : 'failed'}">
            <h3>Medium Level - ${report.mediumLevel.passed ? 'PASSED' : 'NOT PASSED'}</h3>
            <table>
              <tr><td><strong>Attempts:</strong></td><td>${report.mediumLevel.attempts}</td></tr>
              <tr><td><strong>Average Score:</strong></td><td>${report.mediumLevel.averageScore}%</td></tr>
              <tr><td><strong>Individual Scores:</strong></td><td>${report.mediumLevel.scores.map(s => s + '%').join(', ')}</td></tr>
              <tr><td><strong>Correct Answers (Best):</strong></td><td>${Math.round((Math.max(...report.mediumLevel.scores) / 100) * 50)}/50</td></tr>
              <tr><td><strong>Mistakes (Best):</strong></td><td>${50 - Math.round((Math.max(...report.mediumLevel.scores) / 100) * 50)}/50</td></tr>
            </table>
            ${report.mediumLevel.missedLaws.length > 0 ? `<p><strong>Laws Missed:</strong> ${report.mediumLevel.missedLaws.join(', ')}</p>` : ''}
          </div>
          ` : '<p>Medium level not attempted</p>'}

          ${report.hardLevel ? `
          <div class="level-card ${report.hardLevel.passed ? 'passed' : 'failed'}">
            <h3>Hard Level - ${report.hardLevel.passed ? 'PASSED' : 'NOT PASSED'}</h3>
            <table>
              <tr><td><strong>Attempts:</strong></td><td>${report.hardLevel.attempts}</td></tr>
              <tr><td><strong>Average Score:</strong></td><td>${report.hardLevel.averageScore}%</td></tr>
              <tr><td><strong>Individual Scores:</strong></td><td>${report.hardLevel.scores.map(s => s + '%').join(', ')}</td></tr>
              <tr><td><strong>Correct Answers (Best):</strong></td><td>${Math.round((Math.max(...report.hardLevel.scores) / 100) * 50)}/50</td></tr>
              <tr><td><strong>Mistakes (Best):</strong></td><td>${50 - Math.round((Math.max(...report.hardLevel.scores) / 100) * 50)}/50</td></tr>
            </table>
            ${report.hardLevel.missedLaws.length > 0 ? `<p><strong>Laws Missed:</strong> ${report.hardLevel.missedLaws.join(', ')}</p>` : ''}
          </div>
          ` : '<p>Hard level not attempted</p>'}

          ${report.lawsToFocus.length > 0 ? `
          <h2>Areas Requiring Focus</h2>
          <div class="section">
            <p>The following exponential laws need additional practice:</p>
            <ul>
              ${report.lawsToFocus.map(law => `<li>${law}</li>`).join('')}
            </ul>
          </div>
          ` : ''}

          <h2>Recommendations</h2>
          <div class="section">
            ${report.recommendations.length > 0 
              ? report.recommendations.map(rec => `<div class="recommendation">• ${rec}</div>`).join('') 
              : '<p>Complete quiz levels to receive personalized recommendations.</p>'}
          </div>

          <div class="footer">
            <p>This report was generated by EXPONENTIA - The Realm of Exponential Power</p>
            <p>For offline educational assessment purposes</p>
          </div>
        </body>
      </html>
    `;

    // Create a Blob and open it with a proper URL to avoid "about:blank"
    const blob = new Blob([printContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
        // Clean up the URL after printing
        URL.revokeObjectURL(url);
      };
    }
    
    setShowNameDialog(false);
    setFullName('');
  };

  const renderLevelCard = (
    level: StudentReportType['easyLevel'], 
    levelName: string, 
    levelIcon: React.ReactNode
  ) => {
    if (!level) {
      return (
        <Card className="p-4 bg-muted/20 border-border/50">
          <div className="flex items-center gap-3 text-muted-foreground">
            {levelIcon}
            <div>
              <p className="font-semibold">{levelName} Level</p>
              <p className="text-sm">Not attempted yet</p>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card className={`p-4 border-2 ${level.passed ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {levelIcon}
            <div>
              <p className="font-semibold text-foreground">{levelName} Level</p>
              <p className={`text-sm flex items-center gap-1 ${level.passed ? 'text-green-500' : 'text-red-500'}`}>
                {level.passed ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {level.passed ? 'Passed' : 'Not Passed'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">{level.averageScore}%</p>
            <p className="text-xs text-muted-foreground">Average</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Attempts: {level.attempts}/3</span>
            <span className="text-muted-foreground">
              Scores: {level.scores.join('%, ')}%
            </span>
          </div>
          <Progress value={level.averageScore} className="h-2" />
          
          {level.missedLaws.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Laws to review:</p>
              <div className="flex flex-wrap gap-1">
                {level.missedLaws.map((law, i) => (
                  <span key={i} className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded">
                    {law}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      {/* Background */}
      <ExponentiaBackground overlayOpacity={0.5} />
      
      <div className="max-w-4xl mx-auto relative z-10" ref={reportRef}>
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-6 flex-wrap gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/statistics')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-orbitron font-bold text-glow">
                Student Report
              </h1>
              <p className="text-sm text-muted-foreground">
                Performance analysis for {report.playerName || 'Student'}
              </p>
            </div>
          </div>
          <Button onClick={handleDownloadClick} className="gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </motion.div>

        {/* Full Name Dialog */}
        <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Enter Full Name for Report</DialogTitle>
              <DialogDescription>
                Please enter the student's complete name for the official report document.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="e.g., Juan Dela Cruz"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && fullName.trim()) {
                      handleDownloadPDF();
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNameDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleDownloadPDF} disabled={!fullName.trim()}>
                <Download className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Overall Performance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`p-6 mb-6 border-2 ${
            report.overallPerformance === 'needs_attention' 
              ? 'border-red-500 bg-red-500/5' 
              : 'border-primary/20'
          }`}>
            <div className="flex items-center gap-4 mb-4">
              {getPerformanceIcon(report.overallPerformance)}
              <div>
                <h2 className={`text-xl font-bold ${getPerformanceColor(report.overallPerformance)}`}>
                  {getPerformanceLabel(report.overallPerformance)}
                </h2>
                <p className="text-muted-foreground">Overall assessment based on quiz performance</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <p className="text-2xl font-bold text-foreground">{report.totalAttempts}</p>
                <p className="text-xs text-muted-foreground">Total Attempts</p>
              </div>
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <p className="text-2xl font-bold text-foreground">
                  {report.averageScore !== null ? `${report.averageScore}%` : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Average Score</p>
              </div>
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <p className="text-2xl font-bold text-foreground">{report.completedLevels}/3</p>
                <p className="text-xs text-muted-foreground">Levels Passed</p>
              </div>
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <p className="text-2xl font-bold text-foreground">{report.lawsToFocus.length}</p>
                <p className="text-xs text-muted-foreground">Laws to Review</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Attention Alert */}
        {report.overallPerformance === 'needs_attention' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 mb-6 bg-red-500/10 border-2 border-red-500">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-red-500 mb-2">
                    Student Needs Immediate Attention
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    This student has struggled to achieve the passing score after multiple attempts. 
                    The following observations may help guide intervention:
                  </p>
                  <ul className="text-sm space-y-2 text-foreground">
                    <li className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                      Student may have difficulty understanding fundamental exponential concepts
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                      Additional one-on-one instruction is strongly recommended
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                      Consider reviewing prerequisite mathematical skills (multiplication, division)
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                      Student may benefit from alternative learning approaches (visual aids, hands-on activities)
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Level Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h2 className="text-xl font-orbitron font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Quiz Performance by Level
          </h2>
          <div className="space-y-4">
            {renderLevelCard(report.easyLevel, 'Easy', <Star className="w-6 h-6 text-green-500" />)}
            {renderLevelCard(report.mediumLevel, 'Medium', <Star className="w-6 h-6 text-yellow-500" />)}
            {renderLevelCard(report.hardLevel, 'Hard', <Star className="w-6 h-6 text-red-500" />)}
          </div>
        </motion.div>

        {/* Laws to Focus */}
        {report.lawsToFocus.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <h2 className="text-xl font-orbitron font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Areas Requiring Focus
            </h2>
            <Card className="p-4 bg-card/80">
              <p className="text-sm text-muted-foreground mb-3">
                The student frequently missed questions related to these exponential laws:
              </p>
              <div className="space-y-2">
                {report.lawsToFocus.map((law, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-destructive/10 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center text-xs font-bold text-destructive">
                      {index + 1}
                    </div>
                    <span className="text-foreground">{law}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-xl font-orbitron font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Recommendations
          </h2>
          <Card className="p-4 bg-card/80">
            <div className="space-y-3">
              {report.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">{rec}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8 text-sm text-muted-foreground"
        >
          <p>Report generated on {new Date().toLocaleDateString()}</p>
          <p>EXPONENTIA - The Realm of Exponential Power</p>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentReportPage;

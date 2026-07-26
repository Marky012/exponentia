import { useState, useRef } from 'react';
import { Lock, Upload, Download, Trash2, RotateCcw, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAdminStore } from '@/store/adminStore';
import { useStudentStore } from '@/store/studentStore';
import { resetToDefaultQuestions, hasCustomQuestions } from '@/utils/questions';
import { toast } from 'sonner';

export default function AdminSettings() {
  const { changePassword } = useAdminStore();
  const { students, importStudents, clearStudents } = useStudentStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [importing, setImporting] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess(false);
    if (!currentPassword || !newPassword) { setPwError('All fields are required'); return; }
    if (newPassword.length < 6) { setPwError('New password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setPwError('New passwords do not match'); return; }

    const result = await changePassword(currentPassword, newPassword);
    if (result.success) {
      setPwSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed');
      setTimeout(() => setPwSuccess(false), 3000);
    } else {
      setPwError(result.error || 'Failed to change password');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setImporting(true);

    let imported = 0;
    let updated = 0;
    let failed = 0;
    let processed = 0;

    const finish = () => {
      setImporting(false);
      if (imported > 0 || updated > 0) {
        toast.success(`Imported: ${imported}, Updated: ${updated}${failed > 0 ? `, Failed: ${failed}` : ''}`);
      } else if (failed > 0) {
        toast.error(`All ${failed} file(s) failed to import`);
      }
    };

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          const items = Array.isArray(data) ? data : [data];
          const result = importStudents(items);
          imported += result.imported;
          updated += result.updated;
          failed += result.failed;
        } catch {
          failed++;
        }
        processed++;
        if (processed === files.length) finish();
      };
      reader.onerror = () => { failed++; processed++; if (processed === files.length) finish(); };
      reader.readAsText(file);
    }

    if (fileRef.current) fileRef.current.value = '';
  };

  const handleExportStudents = () => {
    if (students.length === 0) { toast.error('No students to export'); return; }
    const blob = new Blob([JSON.stringify(students, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exponentia-students-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Student data exported');
  };

  const handleClearStudents = () => {
    clearStudents();
    setClearDialogOpen(false);
    toast.success('All student data cleared');
  };

  const handleResetQuestions = () => {
    if (!hasCustomQuestions()) { toast.info('No custom questions to reset'); return; }
    resetToDefaultQuestions();
    setResetDialogOpen(false);
    toast.success('Question bank reset to default');
  };

  return (
    <>
    <div className="space-y-6 max-w-2xl">
      <Card className="!bg-background/40 backdrop-blur-md border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Lock className="w-4 h-4" /> Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPw">Current Password</Label>
              <Input id="currentPw" type="password" value={currentPassword} onChange={e => { setCurrentPassword(e.target.value); setPwError(''); }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPw">New Password</Label>
              <Input id="newPw" type="password" value={newPassword} onChange={e => { setNewPassword(e.target.value); setPwError(''); }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPw">Confirm New Password</Label>
              <Input id="confirmPw" type="password" value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setPwError(''); }} />
            </div>
            {pwError && <p className="text-sm text-destructive">{pwError}</p>}
            {pwSuccess && <p className="text-sm text-emerald-500 flex items-center gap-1"><Check className="w-4 h-4" /> Password changed successfully</p>}
            <Button type="submit" size="sm">Update Password</Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <Card className="!bg-background/40 backdrop-blur-md border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Upload className="w-4 h-4" /> Import Student Data
          </CardTitle>
          <CardDescription>Upload .json files exported by students.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Currently imported: <strong>{students.length}</strong> student{students.length !== 1 ? 's' : ''}
          </p>
          <div className="flex gap-2">
            <label>
              <Button variant="outline" size="sm" asChild disabled={importing}>
                <span>
                  {importing ? (
                    <><div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin mr-1" /> Importing...</>
                  ) : (
                    <><Upload className="w-4 h-4 mr-1" /> Import Files</>
                  )}
                </span>
              </Button>
              <input ref={fileRef} type="file" accept=".json" multiple className="hidden" onChange={handleImport} />
            </label>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card className="!bg-background/40 backdrop-blur-md border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Student Data
          </CardTitle>
          <CardDescription>Backup all imported student data as a single JSON file.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" onClick={handleExportStudents} disabled={students.length === 0}>
            <Download className="w-4 h-4 mr-1" /> Export All ({students.length} students)
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <Card className="!bg-background/40 backdrop-blur-md border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Reset Question Bank
          </CardTitle>
          <CardDescription>Reset to the default question bank, removing all custom edits.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" onClick={() => setResetDialogOpen(true)}>
            <RotateCcw className="w-4 h-4 mr-1" /> Reset to Default
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <Card className="!bg-destructive/5 backdrop-blur-md border-destructive/30">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-destructive">
            <Trash2 className="w-4 h-4" /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" size="sm" onClick={() => setClearDialogOpen(true)} disabled={students.length === 0}>
            <Trash2 className="w-4 h-4 mr-1" /> Clear All Student Data
          </Button>
        </CardContent>
      </Card>
    </div>

    <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset Question Bank?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove all custom questions and restore the default question bank. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleResetQuestions}>Reset</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear All Student Data?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete all {students.length} imported student records. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleClearStudents}>Clear All</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

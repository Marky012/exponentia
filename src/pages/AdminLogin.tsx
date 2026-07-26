import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowLeft, Shield } from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { DEFAULT_PASSWORD } from '../utils/adminAuth';
import ExponentiaBackground from '../components/ExponentiaBackground';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { checkSetup, login, setup, isSetup } = useAdminStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Teacher Portal - Exponentia';
    checkSetup();
  }, [checkSetup]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) { setError('Password is required'); return; }
    setLoading(true);
    setError('');
    const result = await login(password);
    setLoading(false);
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/admin');
    } else {
      setError(result.error || 'Incorrect password');
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) { setError('Password is required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    setError('');
    await setup(password);
    setLoading(false);
    toast.success('Admin account created!');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <ExponentiaBackground overlayOpacity={0.6} />
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 z-10"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <Card className="bg-primary/15 border-2 border-primary/60 card-glow-primary card-learning">
          <CardHeader className="text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-3">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <CardTitle className="font-orbitron text-2xl">
              {isSetup ? 'Teacher Portal' : 'Admin Setup'}
            </CardTitle>
            <CardDescription>
              {isSetup
                ? 'Enter your password to access the admin dashboard'
                : `Create your admin password. Default suggestion: "${DEFAULT_PASSWORD}"`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={isSetup ? handleLogin : handleSetup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder={isSetup ? 'Enter password' : `Default: ${DEFAULT_PASSWORD}`}
                    className="pl-10 pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!isSetup && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                      placeholder="Confirm password"
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <Button type="submit" className="w-full font-orbitron" disabled={loading}>
                {loading ? (
                  <motion.div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  isSetup ? 'Login' : 'Create Account'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

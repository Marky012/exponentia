import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Settings, Volume2, VolumeX, Music, MusicIcon, Smartphone, Vibrate, Trash2, Download, Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { soundEffects } from '@/utils/soundEffects';
import { backgroundMusic } from '@/utils/backgroundMusic';
import { STORAGE_KEYS } from '@/constants/quizConfig';
import { haptics } from '@/utils/haptics';
import { useGameStore } from '@/store/gameStore';
import InstallHelpButton from '@/components/InstallHelpButton';
import { CacheManager } from '@/components/CacheManager';

export const SettingsMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isBootPage = location.pathname === '/';
  const [open, setOpen] = useState(false);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [showCache, setShowCache] = useState(false);
  const hapticsEnabled = useGameStore(state => state.hapticsEnabled);
  const setHapticsEnabled = useGameStore(state => state.setHapticsEnabled);
  const pendingCount = useGameStore(state => state.pendingSyncResults.length);
  const clearPendingSyncResults = useGameStore(state => state.clearPendingSyncResults);

  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
    return saved !== null ? saved === 'true' : true;
  });

  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SOUND_VOLUME);
    return saved !== null ? parseFloat(saved) : 0.5;
  });

  const [musicEnabled, setMusicEnabled] = useState(() => backgroundMusic.isEnabled());
  const [musicVolume, setMusicVolume] = useState(() => backgroundMusic.getVolume());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, String(soundEnabled));
    soundEffects.setEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOUND_VOLUME, String(volume));
    soundEffects.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    backgroundMusic.setEnabled(musicEnabled);
  }, [musicEnabled]);

  useEffect(() => {
    backgroundMusic.setVolume(musicVolume);
  }, [musicVolume]);

  const handleHapticsToggle = (enabled: boolean) => {
    setHapticsEnabled(enabled);
    haptics.setEnabled(enabled);
    if (enabled) haptics.light();
  };

  const testSound = () => {
    soundEffects.playClick();
  };

  const handleExportData = () => {
    const state = useGameStore.getState();
    const exportData = {
      exportVersion: 1,
      exportDate: new Date().toISOString(),
      playerName: state.playerName,
      playerGender: state.playerGender,
      laws: state.laws,
      quizLevels: state.quizLevels,
      totalCorrectAnswers: state.totalCorrectAnswers,
      totalIncorrectAnswers: state.totalIncorrectAnswers,
      lawMissedCount: state.lawMissedCount,
      needsAttention: state.needsAttention,
      attentionReason: state.attentionReason,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (state.playerName || 'student').replace(/[^a-zA-Z0-9]/g, '_');
    a.download = `exponentia-data-${safeName}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Settings className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-orbitron">Settings</SheetTitle>
            <SheetDescription>
              Customize your game experience
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Haptics Toggle */}
            {haptics.isSupported() && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Vibrate className={`w-5 h-5 ${hapticsEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                  <Label htmlFor="haptics-toggle" className="font-medium">
                    Haptic Feedback
                  </Label>
                </div>
                <Switch
                  id="haptics-toggle"
                  checked={hapticsEnabled}
                  onCheckedChange={handleHapticsToggle}
                />
              </div>
            )}

            {/* Music Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {musicEnabled ? (
                  <Music className="w-5 h-5 text-primary" />
                ) : (
                  <MusicIcon className="w-5 h-5 text-muted-foreground" />
                )}
                <Label htmlFor="music-toggle" className="font-medium">
                  Background Music
                </Label>
              </div>
              <Switch
                id="music-toggle"
                checked={musicEnabled}
                onCheckedChange={setMusicEnabled}
              />
            </div>

            {/* Music Volume Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-medium">Music Volume</Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round(musicVolume * 100)}%
                </span>
              </div>
              <Slider
                value={[musicVolume]}
                onValueChange={(v) => setMusicVolume(v[0])}
                max={1}
                step={0.1}
                disabled={!musicEnabled}
                className={!musicEnabled ? 'opacity-50' : ''}
              />
            </div>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-primary" />
                ) : (
                  <VolumeX className="w-5 h-5 text-muted-foreground" />
                )}
                <Label htmlFor="sound-toggle" className="font-medium">
                  Sound Effects
                </Label>
              </div>
              <Switch
                id="sound-toggle"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>

            {/* Sound Volume Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-medium">SFX Volume</Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round(volume * 100)}%
                </span>
              </div>
              <Slider
                value={[volume]}
                onValueChange={(v) => setVolume(v[0])}
                max={1}
                step={0.1}
                disabled={!soundEnabled}
                className={!soundEnabled ? 'opacity-50' : ''}
              />
            </div>

            {/* Test Sound Button */}
            <Button
              variant="outline"
              onClick={testSound}
              disabled={!soundEnabled}
              className="w-full"
            >
              Test Sound
            </Button>

            {/* Offline Sync */}
            {pendingCount > 0 && (
              <div className="pt-4 border-t border-border/50 space-y-3">
                <Label className="font-medium text-sm">Offline Data</Label>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{pendingCount} quiz result{pendingCount !== 1 ? 's' : ''} pending sync</span>
                  <Button variant="outline" size="sm" onClick={clearPendingSyncResults} className="h-7 text-xs">
                    Clear
                  </Button>
                </div>
              </div>
            )}

            {/* Cache Management */}
            <div className="pt-4 border-t border-border/50 space-y-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCache(!showCache)}
                className="w-full justify-between text-sm"
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Cache & Storage
                </span>
                <span className="text-xs text-muted-foreground">{showCache ? '▲' : '▼'}</span>
              </Button>
              {showCache && <CacheManager />}
            </div>

            {/* Install Help */}
            <div className="pt-4 border-t border-border/50">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  setOpen(false);
                  setTimeout(() => setShowInstallHelp(true), 300);
                }}
              >
                <Smartphone className="w-4 h-4" />
                How to Install on Phone
              </Button>
            </div>

            {/* Export My Data */}
            <div className="pt-4 border-t border-border/50">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleExportData}
              >
                <Download className="w-4 h-4" />
                Export My Data
              </Button>
            </div>

            {/* Teacher Portal Link - only visible on boot page */}
            {isBootPage && (
              <div className="pt-4 border-t border-border/50 text-center">
                <button
                  onClick={() => { setOpen(false); navigate('/admin/login'); }}
                  className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors inline-flex items-center gap-1"
                >
                  <Shield className="w-3 h-3" />
                  Teacher Portal
                </button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <InstallHelpButton showFloatingButton={false} externalOpen={showInstallHelp} onExternalClose={() => setShowInstallHelp(false)} />
    </>
  );
};
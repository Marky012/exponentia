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
import { Settings, Volume2, VolumeX, Music, MusicIcon, Smartphone, Sun, Moon, Monitor, Vibrate, Trash2 } from 'lucide-react';
import { soundEffects } from '@/utils/soundEffects';
import { backgroundMusic } from '@/utils/backgroundMusic';
import { STORAGE_KEYS } from '@/constants/quizConfig';
import { getThemeMode, setThemeMode, type ThemeMode } from '@/utils/theme';
import { haptics } from '@/utils/haptics';
import { useGameStore } from '@/store/gameStore';
import InstallHelpButton from '@/components/InstallHelpButton';
import { CacheManager } from '@/components/CacheManager';

const THEME_OPTIONS: { value: ThemeMode; icon: React.ReactNode; label: string }[] = [
  { value: 'dark', icon: <Moon className="w-4 h-4" />, label: 'Dark' },
  { value: 'light', icon: <Sun className="w-4 h-4" />, label: 'Light' },
  { value: 'system', icon: <Monitor className="w-4 h-4" />, label: 'System' },
];

export const SettingsMenu = () => {
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
  const [themeMode, setThemeModeState] = useState<ThemeMode>(getThemeMode);

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

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeModeState(mode);
    setThemeMode(mode);
  };

  const handleHapticsToggle = (enabled: boolean) => {
    setHapticsEnabled(enabled);
    haptics.setEnabled(enabled);
    if (enabled) haptics.light();
  };

  const testSound = () => {
    soundEffects.playClick();
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
            {/* Theme Toggle */}
            <div>
              <Label className="font-medium text-sm mb-3 block">Appearance</Label>
              <div className="grid grid-cols-3 gap-2">
                {THEME_OPTIONS.map(opt => (
                  <Button
                    key={opt.value}
                    variant={themeMode === opt.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleThemeChange(opt.value)}
                    className="gap-1.5"
                  >
                    {opt.icon}
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

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
          </div>
        </SheetContent>
      </Sheet>

      <InstallHelpButton showFloatingButton={false} externalOpen={showInstallHelp} onExternalClose={() => setShowInstallHelp(false)} />
    </>
  );
};
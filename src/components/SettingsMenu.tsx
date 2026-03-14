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
import { Settings, Volume2, VolumeX, Music, MusicIcon, Smartphone } from 'lucide-react';
import { soundEffects } from '@/utils/soundEffects';
import { backgroundMusic } from '@/utils/backgroundMusic';
import InstallHelpButton from '@/components/InstallHelpButton';

export const SettingsMenu = () => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('soundEnabled');
    return saved !== null ? saved === 'true' : true;
  });
  
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('soundVolume');
    return saved !== null ? parseFloat(saved) : 0.5;
  });

  const [musicEnabled, setMusicEnabled] = useState(() => backgroundMusic.isEnabled());
  const [musicVolume, setMusicVolume] = useState(() => backgroundMusic.getVolume());

  useEffect(() => {
    localStorage.setItem('soundEnabled', String(soundEnabled));
    soundEffects.setEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('soundVolume', String(volume));
    soundEffects.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    backgroundMusic.setEnabled(musicEnabled);
  }, [musicEnabled]);

  useEffect(() => {
    backgroundMusic.setVolume(musicVolume);
  }, [musicVolume]);

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const handleMusicVolumeChange = (value: number[]) => {
    setMusicVolume(value[0]);
  };

  const testSound = () => {
    soundEffects.playClick();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Settings className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="font-orbitron">Settings</SheetTitle>
          <SheetDescription>
            Customize your game experience
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
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
              onValueChange={handleMusicVolumeChange}
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
              onValueChange={handleVolumeChange}
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
        </div>
      </SheetContent>
    </Sheet>
  );
};

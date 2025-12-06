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
import { Settings, Volume2, VolumeX } from 'lucide-react';
import { soundEffects } from '@/utils/soundEffects';

export const SettingsMenu = () => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('soundEnabled');
    return saved !== null ? saved === 'true' : true;
  });
  
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('soundVolume');
    return saved !== null ? parseFloat(saved) : 0.5;
  });

  useEffect(() => {
    localStorage.setItem('soundEnabled', String(soundEnabled));
    soundEffects.setEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('soundVolume', String(volume));
    soundEffects.setVolume(volume);
  }, [volume]);

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
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

          {/* Volume Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-medium">Volume</Label>
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

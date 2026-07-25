import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { InstallButton } from '@/components/InstallButton';
import { SettingsMenu } from '@/components/SettingsMenu';
import { UserCircle2, Sparkles, AlertCircle, Sword } from 'lucide-react';
import { toast } from 'sonner';
import warriorImage from '@/assets/warrior-character.png';
import mageImage from '@/assets/mage-character.png';
import SparkleEffect from '@/components/SparkleEffect';
import AnimatedBackground from '@/components/AnimatedBackground';
import ExponentiaBackground from '@/components/ExponentiaBackground';
import InstallHelpButton from '@/components/InstallHelpButton';
import { validatePlayerName } from '@/utils/inputValidation';
import { applyGenderTheme } from '@/utils/theme';

// Convert name to sentence case (first letter uppercase, rest lowercase)
const toSentenceCase = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const Welcome = () => {
  const navigate = useNavigate();
  const { setPlayerName, setPlayerGender, startGame } = useGameStore();
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);

  // Preview theme based on selected gender
  useEffect(() => {
    applyGenderTheme(selectedGender);
    
    return () => {
      const storedGender = useGameStore.getState().playerGender;
      applyGenderTheme(storedGender);
    };
  }, [selectedGender]);

  // Validate name on change with debounce effect
  const handleNameChange = (value: string) => {
    setName(value);
    
    // Clear error immediately when typing
    if (nameError) {
      setNameError(null);
    }
  };

  // Validate name on blur
  const handleNameBlur = () => {
    if (name.trim()) {
      const validation = validatePlayerName(name);
      if (!validation.success) {
        setNameError(validation.error || 'Invalid name');
      } else {
        setNameError(null);
      }
    }
  };

  const handleStart = () => {
    // Validate name
    const validation = validatePlayerName(name);
    if (!validation.success) {
      setNameError(validation.error || 'Invalid name');
      toast.error(validation.error || 'Please enter a valid name');
      return;
    }
    
    if (!selectedGender) {
      toast.error('Please select your character');
      return;
    }

    // Convert name to sentence case before saving
    const formattedName = toSentenceCase(validation.data!.trim());
    setPlayerName(formattedName);
    setPlayerGender(selectedGender);
    startGame();
    navigate('/intro');
  };

  const isNameValid = name.trim().length > 0 && !nameError;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Exponentia character background */}
      <ExponentiaBackground overlayOpacity={0.3} />
      
      {/* Animated theme background */}
      <AnimatedBackground theme={selectedGender} />
      
      {/* Settings button in top right */}
      <div className="absolute top-4 right-4 z-20">
        <SettingsMenu />
      </div>
      <motion.div
        className="w-full max-w-2xl relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="p-8 bg-primary/15 border-primary/60 card-learning shadow-2xl">
          <motion.div
            className="text-center mb-8 flex flex-col items-center justify-center w-full mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl sm:text-5xl font-orbitron font-black mb-3 text-glow text-primary text-center w-full">
              Welcome to Exponentia
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground text-center w-full max-w-md mx-auto">
              A realm in danger needs your mathematical prowess
            </p>
          </motion.div>

          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-primary">
                <UserCircle2 className="w-4 h-4" />
                Enter Your Name
              </label>
              <Input
                type="text"
                placeholder="Your name or nickname"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                onBlur={handleNameBlur}
                className={`bg-background/50 border-primary/30 focus:border-primary text-lg ${
                  nameError ? 'border-destructive focus:border-destructive' : ''
                }`}
                maxLength={50}
              />
              <AnimatePresence>
                {nameError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="flex items-center gap-2 text-destructive text-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{nameError}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Gender Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2 text-primary">
                <Sparkles className="w-4 h-4" />
                Choose Your Character
              </label>
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  onClick={() => setSelectedGender('male')}
                  className={`relative p-4 rounded-lg border-2 overflow-hidden ${
                    selectedGender === 'male'
                      ? 'border-[hsl(202,60%,65%)] bg-[hsl(202,60%,65%,0.15)] shadow-[0_0_16px_hsl(202,60%,75%,0.6)]'
                      : 'bg-primary/15 border-primary/60 hover:border-primary/80'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <motion.div 
                        className="w-24 h-24 rounded-full overflow-hidden border-2 border-[hsl(202,60%,50%)] shadow-[0_0_12px_hsl(202,60%,65%,0.4)]"
                        animate={selectedGender === 'male' ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        <img 
                          src={warriorImage} 
                          alt="Warrior character" 
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </motion.div>
                      <SparkleEffect isActive={selectedGender === 'male'} color="blue" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-orbitron font-bold text-lg">Warrior</h3>
                      <p className="text-xs text-muted-foreground mt-1">Blue & Cyan Theme</p>
                      <div className="mt-3 flex flex-col items-center justify-center gap-1.5 w-full max-w-[140px] mx-auto text-center">
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Strength</span>
                          <span className="text-[hsl(202,60%,65%)] text-xs">★★★★☆</span>
                        </div>
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Defense</span>
                          <span className="text-[hsl(202,60%,65%)] text-xs">★★★★★</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {selectedGender === 'male' && (
                    <motion.div
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[hsl(202,60%,65%)] flex items-center justify-center text-[hsl(207,85%,8%)]"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      ✓
                    </motion.div>
                  )}
                </motion.button>

                <motion.button
                  onClick={() => setSelectedGender('female')}
                  className={`relative p-4 rounded-lg border-2 overflow-hidden ${
                    selectedGender === 'female'
                      ? 'border-[hsl(330,85%,65%)] bg-[hsl(330,85%,65%,0.15)] shadow-[0_0_16px_hsl(330,90%,75%,0.6)]'
                      : 'bg-primary/15 border-primary/60 hover:border-primary/80'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <motion.div 
                        className="w-24 h-24 rounded-full overflow-hidden border-2 border-[hsl(330,85%,55%)] shadow-[0_0_12px_hsl(330,85%,65%,0.4)]"
                        animate={selectedGender === 'female' ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        <img 
                          src={mageImage} 
                          alt="Mage character" 
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </motion.div>
                      <SparkleEffect isActive={selectedGender === 'female'} color="pink" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-orbitron font-bold text-lg">Mage</h3>
                      <p className="text-xs text-muted-foreground mt-1">Pink & Magenta Theme</p>
                      <div className="mt-3 flex flex-col items-center justify-center gap-1.5 w-full max-w-[140px] mx-auto text-center">
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Magic</span>
                          <span className="text-[hsl(330,85%,65%)] text-xs">★★★★★</span>
                        </div>
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Speed</span>
                          <span className="text-[hsl(330,85%,65%)] text-xs">★★★★☆</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {selectedGender === 'female' && (
                    <motion.div
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[hsl(330,85%,65%)] flex items-center justify-center text-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      ✓
                    </motion.div>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <Button
                onClick={handleStart}
                size="lg"
                className="w-full text-lg font-orbitron glow gap-2"
                disabled={!isNameValid || !selectedGender}
              >
                <Sword className="w-5 h-5" />
                Begin Your Journey
              </Button>
              
              <InstallButton className="w-full" />
            </div>
          </motion.div>

          {/* Footer Info */}
          <motion.div
            className="mt-8 pt-6 border-t border-border/50 text-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p>Master the 8 Laws of Exponents and save Exponentia!</p>
          </motion.div>
        </Card>
      </motion.div>

      {/* Install help button */}
      <InstallHelpButton />
    </div>
  );
};

export default Welcome;

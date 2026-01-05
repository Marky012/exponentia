import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { InstallButton } from '@/components/InstallButton';
import { SettingsMenu } from '@/components/SettingsMenu';
import { UserCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import warriorImage from '@/assets/warrior-character.png';
import mageImage from '@/assets/mage-character.png';

const Welcome = () => {
  const navigate = useNavigate();
  const { setPlayerName, setPlayerGender, startGame } = useGameStore();
  const [name, setName] = useState('');
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);

  // Preview theme based on selected gender
  useEffect(() => {
    if (selectedGender === 'female') {
      document.body.classList.add('theme-female');
    } else {
      document.body.classList.remove('theme-female');
    }
    
    // Cleanup on unmount - restore based on actual game state
    return () => {
      const storedGender = useGameStore.getState().playerGender;
      if (storedGender === 'female') {
        document.body.classList.add('theme-female');
      } else {
        document.body.classList.remove('theme-female');
      }
    };
  }, [selectedGender]);

  const handleStart = () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!selectedGender) {
      toast.error('Please select your character');
      return;
    }

    setPlayerName(name.trim());
    setPlayerGender(selectedGender);
    startGame();
    navigate('/intro');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Settings button in top right */}
      <div className="absolute top-4 right-4">
        <SettingsMenu />
      </div>
      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="p-8 bg-card/80 backdrop-blur-sm border-2 border-primary/20">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-5xl font-orbitron font-black mb-3 text-glow text-primary">
              Welcome to Exponentia
            </h1>
            <p className="text-lg text-muted-foreground">
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
                onChange={(e) => setName(e.target.value)}
                className="bg-background/50 border-primary/30 focus:border-primary text-lg"
                maxLength={20}
              />
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
                      ? 'border-[hsl(202,60%,65%)] bg-[hsl(202,60%,65%,0.1)] shadow-[0_0_16px_hsl(202,60%,75%,0.6)]'
                      : 'border-border hover:border-[hsl(202,60%,65%,0.5)]'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <motion.div 
                      className="w-24 h-24 rounded-full overflow-hidden border-2 border-[hsl(202,60%,50%)] shadow-[0_0_12px_hsl(202,60%,65%,0.4)]"
                      animate={selectedGender === 'male' ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <img 
                        src={warriorImage} 
                        alt="Warrior character" 
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    <div className="text-center">
                      <h3 className="font-orbitron font-bold text-lg">Warrior</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Blue & Cyan Theme
                      </p>
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
                      ? 'border-[hsl(330,85%,65%)] bg-[hsl(330,85%,65%,0.1)] shadow-[0_0_16px_hsl(330,90%,75%,0.6)]'
                      : 'border-border hover:border-[hsl(330,85%,65%,0.5)]'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <motion.div 
                      className="w-24 h-24 rounded-full overflow-hidden border-2 border-[hsl(330,85%,55%)] shadow-[0_0_12px_hsl(330,85%,65%,0.4)]"
                      animate={selectedGender === 'female' ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <img 
                        src={mageImage} 
                        alt="Mage character" 
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    <div className="text-center">
                      <h3 className="font-orbitron font-bold text-lg">Mage</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Pink & Magenta Theme
                      </p>
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
                className="w-full text-lg font-orbitron glow"
                disabled={!name.trim() || !selectedGender}
              >
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
    </div>
  );
};

export default Welcome;

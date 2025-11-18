import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { InstallButton } from '@/components/InstallButton';

const Intro = () => {
  const navigate = useNavigate();
  const { playerName, completeIntro } = useGameStore();

  const handleContinue = () => {
    completeIntro();
    navigate('/laws');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-4xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="p-8 bg-card/80 backdrop-blur-sm border-2 border-primary/20">
          {/* Elexia Character */}
          <motion.div
            className="flex justify-center mb-6"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            <div className="relative">
              <div className="text-9xl animate-float">✨</div>
              <motion.div
                className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
            </div>
          </motion.div>

          {/* Dialogue */}
          <motion.div
            className="space-y-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl font-orbitron font-bold text-primary flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6" />
              Elexia, Guardian of Exponentia
            </h2>

            <div className="space-y-4 text-lg text-foreground">
              <p>
                Greetings, <span className="font-bold text-primary">{playerName}</span>...
              </p>
              
              <p>
                I am Elexia, the last guardian of this fading realm. Our world once thrived
                on the power of exponential energy, but the <span className="text-enemy font-semibold">Nullers</span> have
                been draining our power, reducing everything to nothing.
              </p>

              <div className="bg-muted/30 border border-primary/20 rounded-lg p-6 my-6">
                <p className="font-medium">
                  The Crystal Core, source of all our energy, is failing. Without it,
                  Exponentia will crumble into darkness.
                </p>
              </div>

              <p>
                But there is hope! The ancient <span className="text-gem font-bold">8 Laws of Exponents</span> hold
                the key to restoring our power. Master these laws, collect the 8 Gems of Power,
                and you can defeat the Nullers once and for all.
              </p>

              <p className="text-primary font-semibold">
                Your journey begins at the Chamber of Sparks, where you'll learn to harness
                exponential compression. Are you ready, {playerName}?
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-6">
              <Button
                onClick={handleContinue}
                size="lg"
                className="w-full text-lg font-orbitron glow"
              >
                Begin My Training
              </Button>
              
              <InstallButton className="w-full" />
            </div>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Intro;

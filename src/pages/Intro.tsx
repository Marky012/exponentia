import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { InstallButton } from '@/components/InstallButton';
import { useState, useEffect } from 'react';
import elexiaIntro from '@/assets/elexia-intro.png';
import elexiaWorried from '@/assets/elexia-worried.png';
import elexiaHopeful from '@/assets/elexia-hopeful.png';
import nullersImage from '@/assets/nullers.png';
import exponentiaLight from '@/assets/exponentia-light.png';
import exponentiaDark from '@/assets/exponentia-dark.png';

const Intro = () => {
  const navigate = useNavigate();
  const { playerName, completeIntro } = useGameStore();
  const [storyStage, setStoryStage] = useState(0);

  // Auto-progress through story stages
  useEffect(() => {
    const timers = [
      setTimeout(() => setStoryStage(1), 3000),  // After 3s: show worried Elexia
      setTimeout(() => setStoryStage(2), 8000),  // After 8s: show Nullers background
      setTimeout(() => setStoryStage(3), 13000), // After 13s: show hopeful Elexia with dark background
      setTimeout(() => setStoryStage(4), 18000), // After 18s: show final call to action
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  const handleContinue = () => {
    completeIntro();
    navigate('/laws');
  };

  // Determine which character image to show
  const getCharacterImage = () => {
    if (storyStage === 0) return elexiaIntro;
    if (storyStage >= 3) return elexiaHopeful;
    return elexiaWorried;
  };

  // Determine background image
  const getBackgroundImage = () => {
    if (storyStage >= 3) return exponentiaDark;
    if (storyStage === 2) return nullersImage; // Show Nullers during Crystal Core paragraph
    return exponentiaLight;
  };

  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${getBackgroundImage()})`
      }}
      animate={{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${getBackgroundImage()})`
      }}
      transition={{ duration: 1.5 }}
    >
      <motion.div
        className="w-full max-w-5xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="p-8 bg-card/90 backdrop-blur-md border-2 border-primary/20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Character Image Column */}
            <div className="flex justify-center">
              <div className="relative">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={getCharacterImage()}
                    src={getCharacterImage()} 
                    alt="Elexia the Guardian" 
                    className="w-full max-w-sm drop-shadow-2xl"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                  />
                </AnimatePresence>
                <motion.div
                  className="absolute -inset-4 bg-primary/20 rounded-full blur-3xl -z-10"
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
            </div>

            {/* Dialogue Column */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-3xl font-orbitron font-bold text-primary flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                Elexia, Guardian of Exponentia
              </h2>

              <div className="space-y-4 text-base text-foreground">
                {/* Stage 0: Greeting */}
                <AnimatePresence>
                  {storyStage === 0 && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5 }}
                    >
                      Greetings, <span className="font-bold text-primary">{playerName}</span>...
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Stage 1: Introduction of the problem */}
                <AnimatePresence>
                  {storyStage >= 1 && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5 }}
                    >
                      I am Elexia, the last guardian of this fading realm. Our world once thrived
                      on the power of exponential energy, but the <span className="text-enemy font-semibold">Nullers</span> have
                      been draining our power, reducing everything to nothing.
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Stage 2: Crystal Core warning */}
                <AnimatePresence>
                  {storyStage >= 2 && (
                    <motion.div 
                      className="bg-muted/30 border border-destructive/30 rounded-lg p-4 my-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5 }}
                    >
                      <p className="font-medium text-sm">
                        The Crystal Core, source of all our energy, is failing. Without it,
                        Exponentia will crumble into darkness.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Stage 3: Hope and solution */}
                <AnimatePresence>
                  {storyStage >= 3 && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5 }}
                    >
                      But there is hope! The ancient <span className="text-gem font-bold">8 Laws of Exponents</span> hold
                      the key to restoring our power. Master these laws, collect the 8 Gems of Power,
                      and you can defeat the Nullers once and for all.
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Stage 4: Call to action */}
                <AnimatePresence>
                  {storyStage >= 4 && (
                    <motion.p 
                      className="text-primary font-semibold"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5 }}
                    >
                      Your journey begins at the Chamber of Sparks, where you'll learn to harness
                      exponential compression. Are you ready, {playerName}?
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Buttons */}
              <AnimatePresence>
                {storyStage >= 4 && (
                  <motion.div 
                    className="flex flex-col gap-3 pt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Button
                      onClick={handleContinue}
                      size="lg"
                      className="w-full text-lg font-orbitron glow"
                    >
                      Begin My Training
                    </Button>
                    
                    <InstallButton className="w-full" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Intro;

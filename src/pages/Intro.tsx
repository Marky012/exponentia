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
      className="relative min-h-screen flex flex-col items-center justify-between p-4 bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${getBackgroundImage()})`
      }}
      animate={{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${getBackgroundImage()})`
      }}
      transition={{ duration: 1.5 }}
    >
      {/* Main Content - Side by Side Layout */}
      <div className="flex-1 flex items-center justify-center w-full max-w-7xl mx-auto px-4 md:px-8 gap-8 md:gap-12 flex-col md:flex-row">
        {/* Character Image - Left Side */}
        <div className="relative w-full md:w-1/2 flex justify-center md:justify-end">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.img 
                key={getCharacterImage()}
                src={getCharacterImage()} 
                alt="Elexia the Guardian" 
                className="w-full max-w-sm md:max-w-md h-auto drop-shadow-2xl"
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

        {/* Dialogue Box - Right Side */}
        <motion.div
          className="w-full md:w-1/2 space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Character Name Tag */}
          <AnimatePresence>
            {storyStage >= 0 && (
              <motion.div
                className="flex items-center gap-2 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
              >
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-xl md:text-2xl font-orbitron font-bold text-primary">
                  Elexia, Guardian of Exponentia
                </h2>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dialogue Box */}
          <div className="min-h-[200px] md:min-h-[300px] flex items-center">
            <div className="w-full bg-black/60 backdrop-blur-sm rounded-lg p-6 border border-primary/20">
              <div className="space-y-3 text-left">
                {/* Stage 0: Greeting */}
                <AnimatePresence>
                  {storyStage === 0 && (
                    <motion.p
                      className="text-lg md:text-xl text-foreground"
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
                      className="text-base md:text-lg text-foreground"
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
                    <motion.p 
                      className="text-base md:text-lg text-foreground font-medium border-l-4 border-destructive pl-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5 }}
                    >
                      The Crystal Core, source of all our energy, is failing. Without it,
                      Exponentia will crumble into darkness.
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Stage 3: Hope and solution */}
                <AnimatePresence>
                  {storyStage >= 3 && (
                    <motion.p
                      className="text-base md:text-lg text-foreground"
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
                      className="text-base md:text-lg text-primary font-semibold"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5 }}
                    >
                      Your journey begins at the Chamber of Sparks, where you&apos;ll learn to harness
                      exponential compression. Are you ready, {playerName}?
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
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
    </motion.div>
  );
};

export default Intro;

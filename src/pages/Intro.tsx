import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { InstallButton } from '@/components/InstallButton';
import { useState } from 'react';
import { useTypewriter } from '@/hooks/use-typewriter';
import { ArrowLeft } from 'lucide-react';
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

  // Dialogue texts
  const dialogues = [
    `Greetings, ${playerName}...`,
    `I am Elexia, the last guardian of this fading realm. Our world once thrived on the power of exponential energy, but the Nullers have been draining our power, reducing everything to nothing.`,
    `The Crystal Core, source of all our energy, is failing. Without it, Exponentia will crumble into darkness.`,
    `But there is hope! The ancient 8 Laws of Exponents hold the key to restoring our power. Master these laws, collect the 8 Gems of Power, and you can defeat the Nullers once and for all.`,
    `Your journey begins at the Chamber of Sparks, where you'll learn to harness exponential compression. Are you ready, ${playerName}?`
  ];

  const { displayedText, isComplete } = useTypewriter(
    dialogues[storyStage] || '',
    30,
    true
  );

  const handleContinue = () => {
    if (storyStage < dialogues.length - 1) {
      setStoryStage(storyStage + 1);
    } else {
      completeIntro();
      navigate('/laws');
    }
  };

  const handleBack = () => {
    if (storyStage > 0) {
      setStoryStage(storyStage - 1);
    }
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
        {/* Character Image - Left Side - CONSISTENT SIZE */}
        <div className="relative w-full md:w-1/2 flex justify-center md:justify-end">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.img 
                key={getCharacterImage()}
                src={getCharacterImage()} 
                alt="Elexia the Guardian" 
                className="w-64 h-64 md:w-80 md:h-80 object-contain drop-shadow-2xl"
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
          <div className="min-h-[200px] md:min-h-[300px] flex flex-col justify-between">
            <div className="w-full bg-black/60 backdrop-blur-sm rounded-lg p-6 border border-primary/20 flex-1 flex items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={storyStage}
                  className="space-y-3 text-left w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {storyStage === 0 && (
                    <p className="text-lg md:text-xl text-foreground">
                      {displayedText}
                    </p>
                  )}
                  {storyStage === 1 && (
                    <p className="text-base md:text-lg text-foreground">
                      {displayedText.split('Nullers').map((part, i, arr) => (
                        i < arr.length - 1 ? (
                          <span key={i}>
                            {part}
                            <span className="text-red-500 font-semibold">Nullers</span>
                          </span>
                        ) : part
                      ))}
                    </p>
                  )}
                  {storyStage === 2 && (
                    <p className="text-base md:text-lg text-foreground font-medium border-l-4 border-destructive pl-4">
                      {displayedText}
                    </p>
                  )}
                  {storyStage === 3 && (
                    <p className="text-base md:text-lg text-foreground">
                      {displayedText.split('8 Laws of Exponents').map((part, i, arr) => (
                        i < arr.length - 1 ? (
                          <span key={i}>
                            {part}
                            <span className="text-green-400 font-bold">8 Laws of Exponents</span>
                          </span>
                        ) : part
                      ))}
                    </p>
                  )}
                  {storyStage === 4 && (
                    <p className="text-base md:text-lg text-primary font-semibold">
                      {displayedText}
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <motion.div 
              className="flex flex-col gap-3 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: isComplete ? 1 : 0.5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex gap-3">
                {storyStage > 0 && (
                  <Button
                    onClick={handleBack}
                    size="lg"
                    variant="outline"
                    disabled={!isComplete}
                    className="text-lg font-orbitron"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </Button>
                )}
                <Button
                  onClick={handleContinue}
                  size="lg"
                  disabled={!isComplete}
                  className="flex-1 text-lg font-orbitron glow"
                >
                  {storyStage === dialogues.length - 1 ? 'Begin My Training' : 'Continue'}
                </Button>
              </div>
              
              {storyStage === dialogues.length - 1 && (
                <InstallButton className="w-full" />
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Intro;

import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { InstallButton } from '@/components/InstallButton';
import elexiaIntro from '@/assets/elexia-intro.png';
import elexiaWorried from '@/assets/elexia-worried.png';
import elexiaHopeful from '@/assets/elexia-hopeful.png';
import nullersImage from '@/assets/nullers.png';
import exponentiaLight from '@/assets/exponentia-light.png';
import exponentiaDark from '@/assets/exponentia-dark.png';

const Intro = () => {
  const navigate = useNavigate();
  const { playerName, completeIntro } = useGameStore();

  const handleContinue = () => {
    completeIntro();
    navigate('/laws');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat transition-all duration-1000"
      style={{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${exponentiaLight})`
      }}
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
            <motion.div
              className="flex justify-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring" }}
            >
              <div className="relative">
                <img 
                  src={elexiaIntro} 
                  alt="Elexia the Guardian" 
                  className="w-full max-w-sm drop-shadow-2xl"
                />
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
            </motion.div>

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
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <p>
                    Greetings, <span className="font-bold text-primary">{playerName}</span>...
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="relative"
                >
                  <img 
                    src={elexiaWorried} 
                    alt="Elexia Worried" 
                    className="absolute -left-20 top-0 w-16 h-16 object-contain opacity-50"
                  />
                  <p>
                    I am Elexia, the last guardian of this fading realm. Our world once thrived
                    on the power of exponential energy, but the <span className="text-enemy font-semibold">Nullers</span> have
                    been draining our power, reducing everything to nothing.
                  </p>
                </motion.div>

                <motion.div 
                  className="bg-muted/30 border border-destructive/30 rounded-lg p-4 my-4 relative overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  <img 
                    src={nullersImage} 
                    alt="The Nullers" 
                    className="absolute right-2 top-2 w-12 h-12 object-contain opacity-30"
                  />
                  <p className="font-medium text-sm">
                    The Crystal Core, source of all our energy, is failing. Without it,
                    Exponentia will crumble into darkness.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                  className="relative"
                >
                  <img 
                    src={elexiaHopeful} 
                    alt="Elexia Hopeful" 
                    className="absolute -left-20 top-0 w-16 h-16 object-contain opacity-50"
                  />
                  <p>
                    But there is hope! The ancient <span className="text-gem font-bold">8 Laws of Exponents</span> hold
                    the key to restoring our power. Master these laws, collect the 8 Gems of Power,
                    and you can defeat the Nullers once and for all.
                  </p>
                </motion.div>

                <motion.p 
                  className="text-primary font-semibold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.5 }}
                >
                  Your journey begins at the Chamber of Sparks, where you'll learn to harness
                  exponential compression. Are you ready, {playerName}?
                </motion.p>
              </div>

              {/* Action Buttons */}
              <motion.div 
                className="flex flex-col gap-3 pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3 }}
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
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Intro;

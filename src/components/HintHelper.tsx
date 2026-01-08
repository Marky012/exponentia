import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Lightbulb } from 'lucide-react';
import helperImage from '@/assets/helper-pet.png';

interface HintHelperProps {
  hint: string;
  onHintUsed: () => void;
  hintAvailable: boolean;
}

export const HintHelper = ({ hint, onHintUsed, hintAvailable }: HintHelperProps) => {
  const [showHint, setShowHint] = useState(false);

  const handleShowHint = () => {
    if (!hintAvailable) return;
    setShowHint(true);
    onHintUsed();
  };

  return (
    <>
      {/* Floating Helper Pet */}
      <motion.div
        className="fixed right-4 sm:right-8 bottom-4 sm:bottom-8 z-40 flex flex-col items-center"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 0.8 }}
      >
        <motion.button
          onClick={handleShowHint}
          disabled={!hintAvailable}
          className={`relative ${!hintAvailable && 'opacity-50 cursor-not-allowed'}`}
          whileHover={hintAvailable ? { scale: 1.1 } : {}}
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            y: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        >
          <img 
            src={helperImage} 
            alt="Helper Pet" 
            className="w-24 h-24 drop-shadow-2xl"
          />
          {hintAvailable && (
            <motion.div
              className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            >
              <Lightbulb className="w-4 h-4 text-primary-foreground" />
            </motion.div>
          )}
        </motion.button>
        {hintAvailable && (
          <motion.div
            className="mt-2 whitespace-nowrap bg-card/90 backdrop-blur-sm border border-primary/20 rounded-lg px-3 py-1.5 text-xs font-medium"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Click for hint!
          </motion.div>
        )}
      </motion.div>

      {/* Hint Modal */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHint(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="max-w-md p-6 bg-card border-2 border-primary/30">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <img src={helperImage} alt="Helper" className="w-12 h-12" />
                    <h3 className="text-lg font-orbitron font-bold text-primary">
                      Helper's Hint
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowHint(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="bg-muted/30 border border-primary/20 rounded-lg p-4 mb-4">
                  <p className="text-foreground">{hint}</p>
                </div>

                <Button onClick={() => setShowHint(false)} className="w-full">
                  Got it!
                </Button>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

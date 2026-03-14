import { useState } from 'react';
import { HelpCircle, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface InstallHelpButtonProps {
  showFloatingButton?: boolean;
  externalOpen?: boolean;
  onExternalClose?: () => void;
}

const InstallHelpButton = ({ showFloatingButton = true, externalOpen, onExternalClose }: InstallHelpButtonProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = (val: boolean) => {
    if (externalOpen !== undefined) {
      if (!val && onExternalClose) onExternalClose();
    } else {
      setInternalOpen(val);
    }
  };

  if (!showFloatingButton && !isOpen) return null;

  return (
    <>
      {/* Help button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-md flex items-center justify-center text-primary hover:bg-primary/30 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Installation help"
      >
        <HelpCircle className="w-6 h-6" />
      </motion.button>

      {/* Modal overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Content */}
            <motion.div
              className="relative w-full max-w-md bg-card border-2 border-primary/20 rounded-2xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <Smartphone className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-orbitron font-bold text-primary">
                  Install Exponentia
                </h2>
              </div>

              {/* Android Instructions */}
              <div className="mb-6">
                <h3 className="text-sm font-orbitron font-bold text-accent mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs">🤖</span>
                  Android (Chrome)
                </h3>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary font-bold shrink-0">1.</span>
                    <span>Open this game in <strong className="text-foreground">Google Chrome</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold shrink-0">2.</span>
                    <span>Tap the <strong className="text-foreground">"Download for Offline Play"</strong> button if it appears, OR tap the <strong className="text-foreground">⋮ menu</strong> (three dots)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold shrink-0">3.</span>
                    <span>Select <strong className="text-foreground">"Install app"</strong> or <strong className="text-foreground">"Add to Home screen"</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold shrink-0">4.</span>
                    <span>Tap <strong className="text-foreground">"Install"</strong> to confirm</span>
                  </li>
                </ol>
              </div>

              {/* iOS Instructions */}
              <div className="mb-4">
                <h3 className="text-sm font-orbitron font-bold text-accent mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs">🍎</span>
                  iPhone / iPad (Safari)
                </h3>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary font-bold shrink-0">1.</span>
                    <span>Open this game in <strong className="text-foreground">Safari</strong> (required for iOS)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold shrink-0">2.</span>
                    <span>Tap the <strong className="text-foreground">Share button</strong> (square with arrow ↑) at the bottom</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold shrink-0">3.</span>
                    <span>Scroll down and tap <strong className="text-foreground">"Add to Home Screen"</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold shrink-0">4.</span>
                    <span>Tap <strong className="text-foreground">"Add"</strong> in the top right corner</span>
                  </li>
                </ol>
              </div>

              <div className="pt-4 border-t border-border/50 text-xs text-muted-foreground/70 text-center">
                Once installed, the game will work offline with all resources cached!
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InstallHelpButton;

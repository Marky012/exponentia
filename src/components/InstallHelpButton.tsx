import { useState } from 'react';
import { HelpCircle, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


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
      {/* Help button - only shown when showFloatingButton is true */}
      {showFloatingButton && (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-md flex items-center justify-center text-primary hover:bg-primary/30 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Installation help"
        >
          <HelpCircle className="w-6 h-6" />
        </motion.button>
      )}

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
                  <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current text-accent" aria-hidden="true">
                      <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.27-.86-.31-.16-.69-.04-.86.27l-1.87 3.24c-1.14-.48-2.41-.76-3.76-.76s-2.62.28-3.76.76L6.97 5.71c-.16-.31-.55-.43-.86-.27-.31.16-.43.55-.27.86L7.68 9.48C4.55 11.22 2.45 14.38 2 18h20c-.45-3.62-2.55-6.78-5.68-8.52zM7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z"/>
                    </svg>
                  </span>
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
                  <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current text-accent" aria-hidden="true">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                  </span>
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

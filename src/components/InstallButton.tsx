import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Download, CheckCircle2, HardDrive } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BeforeInstallPromptEvent } from '@/types/game';

export const InstallButton = ({ className }: { className?: string }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const installedHandler = () => {
      setIsInstalled(true);
      setIsInstallable(false);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setTimeout(() => {
        setIsInstalling(false);
        setIsInstalled(true);
      }, 500);
    } else {
      setIsInstalling(false);
    }
  };

  if (isInstalled) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg bg-gem/20 border border-gem/40 text-gem text-sm font-orbitron font-bold",
          className
        )}
      >
        <CheckCircle2 className="w-4 h-4" />
        <span>Installed</span>
      </motion.div>
    );
  }

  if (!isInstallable) return null;

  return (
    <AnimatePresence mode="wait">
      {isInstalling ? (
        <motion.div
          key="installing"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gem/20 border border-gem/40 text-gem text-sm font-orbitron font-bold",
            className
          )}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <HardDrive className="w-4 h-4" />
          </motion.div>
          <span>Saving to device...</span>
        </motion.div>
      ) : (
        <motion.div
          key="install"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <Button
            onClick={handleInstall}
            variant="default"
            size="lg"
            className={cn("glow animate-pulseGlow gap-2 bg-gem/90 hover:bg-gem text-background border-gem/50 font-orbitron font-bold", className)}
          >
            <Download className="w-5 h-5" />
            Download for Offline Play
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

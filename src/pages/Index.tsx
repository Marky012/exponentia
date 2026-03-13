import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Download, Wifi, WifiOff } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import InstallHelpButton from '@/components/InstallHelpButton';

type BootPhase = 'boot' | 'downloading' | 'ready';

const Index = () => {
  const navigate = useNavigate();
  const hasStarted = useGameStore((state) => state.hasStarted);
  const [phase, setPhase] = useState<BootPhase>('boot');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing...');
  const [isStandalone] = useState(() =>
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true
  );

  const navigateToGame = useCallback(() => {
    if (hasStarted) {
      navigate('/hub');
    } else {
      navigate('/welcome');
    }
  }, [hasStarted, navigate]);

  useEffect(() => {
    // After boot animation, check if we need to download resources
    const bootTimer = setTimeout(() => {
      if ('serviceWorker' in navigator) {
        setPhase('downloading');
      } else {
        // No SW support, just proceed
        navigateToGame();
      }
    }, 2000);

    return () => clearTimeout(bootTimer);
  }, [navigateToGame]);

  // Resource downloading phase
  useEffect(() => {
    if (phase !== 'downloading') return;

    let cancelled = false;

    const trackCaching = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;

        // Check if SW is already active and controlling
        if (navigator.serviceWorker.controller) {
          // SW already controlling - assets likely cached
          // Quick verification scan
          setStatusText('Verifying game files...');
          setDownloadProgress(30);

          // Check cache for key assets
          const cacheNames = await caches.keys();
          if (cacheNames.length > 0) {
            // Cache exists, do a quick progress animation
            const steps = [
              { progress: 50, text: 'Loading audio assets...' },
              { progress: 70, text: 'Loading video lessons...' },
              { progress: 85, text: 'Loading game images...' },
              { progress: 95, text: 'Preparing Exponentia...' },
              { progress: 100, text: 'Ready to play!' },
            ];

            for (let i = 0; i < steps.length; i++) {
              if (cancelled) return;
              await new Promise(r => setTimeout(r, 400));
              setDownloadProgress(steps[i].progress);
              setStatusText(steps[i].text);
            }
          } else {
            // No cache yet, wait for precaching
            await waitForPrecaching(cancelled);
          }
        } else {
          // SW not yet controlling - first install, wait for full caching
          setStatusText('Downloading game resources...');
          setDownloadProgress(5);

          // Listen for the SW to become active
          if (registration.installing || registration.waiting) {
            const sw = registration.installing || registration.waiting;
            if (sw) {
              await new Promise<void>((resolve) => {
                sw.addEventListener('statechange', () => {
                  if (sw.state === 'activated') resolve();
                });
                if (sw.state === 'activated') resolve();
              });
            }
          }

          await waitForPrecaching(cancelled);
        }

        if (!cancelled) {
          setPhase('ready');
          await new Promise(r => setTimeout(r, 800));
          navigateToGame();
        }
      } catch (err) {
        console.warn('SW caching check failed, proceeding anyway:', err);
        if (!cancelled) {
          // Still proceed even if caching check fails
          setDownloadProgress(100);
          setStatusText('Ready to play!');
          setPhase('ready');
          await new Promise(r => setTimeout(r, 500));
          navigateToGame();
        }
      }
    };

    const waitForPrecaching = async (isCancelled: boolean) => {
      // Simulate progress based on expected asset count
      // We know we have ~20+ images, 8 videos, 1 audio file
      const expectedAssets = 35;
      let cachedCount = 0;

      const downloadStages = [
        { progress: 10, text: 'Downloading core game files...' },
        { progress: 25, text: 'Downloading character assets...' },
        { progress: 40, text: 'Downloading map illustrations...' },
        { progress: 55, text: 'Downloading audio tracks...' },
        { progress: 70, text: 'Downloading video lessons...' },
        { progress: 85, text: 'Downloading UI resources...' },
        { progress: 92, text: 'Finalizing installation...' },
      ];

      for (let i = 0; i < downloadStages.length; i++) {
        if (isCancelled) return;
        await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

        // Check actual cache progress
        try {
          const cacheNames = await caches.keys();
          let totalCached = 0;
          for (const name of cacheNames) {
            const cache = await caches.open(name);
            const keys = await cache.keys();
            totalCached += keys.length;
          }
          cachedCount = totalCached;

          // Blend simulated progress with actual cache count
          const cacheProgress = Math.min((cachedCount / expectedAssets) * 100, 95);
          const stageProgress = downloadStages[i].progress;
          const blended = Math.max(cacheProgress, stageProgress);

          setDownloadProgress(Math.round(blended));
        } catch {
          setDownloadProgress(downloadStages[i].progress);
        }

        setStatusText(downloadStages[i].text);
      }

      if (!isCancelled) {
        setDownloadProgress(100);
        setStatusText('All resources downloaded!');
      }
    };

    trackCaching();

    return () => {
      cancelled = true;
    };
  }, [phase, navigateToGame]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary rounded-full opacity-30"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 600),
            }}
            animate={{
              y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 600)],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Logo and title */}
      <motion.div
        className="text-center z-10 w-full max-w-md px-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          className="relative inline-block mb-6"
          animate={{
            rotateY: [0, 360],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 1,
          }}
        >
          <div className="text-8xl font-orbitron font-black text-primary glow-strong">
            E
          </div>
          <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-secondary animate-pulse" />
          <Zap className="absolute -bottom-4 -left-4 w-8 h-8 text-accent animate-pulse" />
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl font-orbitron font-black mb-4 text-glow px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          EXPONENTIA
        </motion.h1>

        <motion.p
          className="text-xl text-muted-foreground font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          The Realm of Exponential Power
        </motion.p>

        <motion.p
          className="text-sm text-muted-foreground/70 mt-2 italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          by: Jeemark Naceel Calungsod Alojado
        </motion.p>

        {/* Download / Boot Progress Section */}
        <AnimatePresence mode="wait">
          {phase === 'boot' && (
            <motion.div
              key="boot"
              className="mt-8 flex gap-2 justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full bg-primary"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          )}

          {(phase === 'downloading' || phase === 'ready') && (
            <motion.div
              key="downloading"
              className="mt-8 space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Status icon */}
              <motion.div
                className="flex items-center justify-center gap-2 text-primary"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {phase === 'ready' ? (
                  <Sparkles className="w-5 h-5" />
                ) : (
                  <Download className="w-5 h-5 animate-bounce" />
                )}
                <span className="text-sm font-medium font-orbitron">
                  {statusText}
                </span>
              </motion.div>

              {/* Progress bar */}
              <div className="relative">
                <Progress value={downloadProgress} className="h-3 bg-muted/50" />
                <motion.div
                  className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
                  animate={{ opacity: [0, 0.3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <div className="h-full w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                </motion.div>
              </div>

              {/* Percentage */}
              <p className="text-xs text-muted-foreground font-orbitron">
                {Math.round(downloadProgress)}%
              </p>

              {/* Offline indicator for standalone mode */}
              {isStandalone && (
                <motion.div
                  className="flex items-center justify-center gap-1 text-xs text-muted-foreground/60"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {downloadProgress >= 100 ? (
                    <>
                      <WifiOff className="w-3 h-3" />
                      <span>Offline play ready</span>
                    </>
                  ) : (
                    <>
                      <Wifi className="w-3 h-3" />
                      <span>Preparing offline play...</span>
                    </>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <InstallHelpButton />
    </div>
  );
};

export default Index;

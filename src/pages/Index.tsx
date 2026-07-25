import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Zap, Download, Wifi, WifiOff, AlertTriangle,
  HardDrive, Film, Image, Music, FileCode, CheckCircle2,
  Shield, Sword, PackageCheck, Save
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import InstallHelpButton from '@/components/InstallHelpButton';
import exponentiaDark from '@/assets/exponentia-dark.png';
import { BeforeInstallPromptEvent } from '@/types/game';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';

  type BootPhase = 'boot' | 'connecting' | 'downloading' | 'saving' | 'ready';

  const PHASE_MESSAGES: Record<BootPhase, string> = {
    boot: 'Awakening Exponentia...',
    connecting: 'Opening portal...',
    downloading: 'Gathering forces...',
    saving: 'Sealing the realm...',
    ready: 'Enter the realm!',
  };

const CACHE_TOTAL_ESTIMATE = 84;

const Index = () => {
  const navigate = useNavigate();
  const hasStarted = useGameStore((state) => state.hasStarted);
  const [phase, setPhase] = useState<BootPhase>('boot');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [cachedCount, setCachedCount] = useState(0);
  const [totalBytesEstimate] = useState(142 * 1024 * 1024);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [offlineCacheProgress, setOfflineCacheProgress] = useState(0);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installDismissed, setInstallDismissed] = useState(false);
  const [isStandalone] = useState(() =>
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true
  );
  const [milestone25, setMilestone25] = useState(false);
  const [milestone50, setMilestone50] = useState(false);
  const [milestone75, setMilestone75] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const navigateToGame = useCallback(() => {
    if (hasStarted) {
      navigate('/hub');
    } else {
      navigate('/welcome');
    }
  }, [hasStarted, navigate]);

  const getTotalCachedCount = useCallback(async (): Promise<number> => {
    try {
      const cacheNames = await caches.keys();
      let total = 0;
      for (const name of cacheNames) {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        total += keys.length;
      }
      return total;
    } catch {
      return 0;
    }
  }, []);

  const isFullyCached = useCallback(async (): Promise<boolean> => {
    try {
      const cacheNames = await caches.keys();
      if (cacheNames.length === 0) return false;
      let foundCount = 0;
      for (const name of cacheNames) {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        foundCount += keys.length;
      }
      return foundCount >= CACHE_TOTAL_ESTIMATE * 0.8;
    } catch {
      return false;
    }
  }, []);

  // PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setInstallDismissed(true);
    }
  };

  // Offline modal
  useEffect(() => {
    const checkOfflineReadiness = async () => {
      if (!navigator.onLine) {
        const cachedCount = await getTotalCachedCount();
        if (cachedCount < 10) {
          setShowOfflineModal(true);
          const pollInterval = setInterval(async () => {
            const count = await getTotalCachedCount();
            setOfflineCacheProgress(Math.min(Math.round((count / CACHE_TOTAL_ESTIMATE) * 100), 100));
            if (navigator.onLine || count >= 10) {
              clearInterval(pollInterval);
              setShowOfflineModal(false);
            }
          }, 1500);
          return () => clearInterval(pollInterval);
        }
      }
    };
    checkOfflineReadiness();
  }, [getTotalCachedCount]);

  // Main boot sequence
  useEffect(() => {
    const bootTimer = setTimeout(async () => {
      const cached = await isFullyCached();
      if (cached) {
        setIsReturningUser(true);
        setPhase('saving');
        setDownloadProgress(95);
        setTimeout(() => {
          setDownloadProgress(100);
          setPhase('ready');
        }, 400);
      } else if ('serviceWorker' in navigator) {
        setPhase('connecting');
      } else {
        setPhase('ready');
      }
    }, 1200);

    return () => clearTimeout(bootTimer);
  }, [isFullyCached]);

  // Connecting phase
  useEffect(() => {
    if (phase !== 'connecting') return;

    let cancelled = false;

    const connect = async () => {
      try {
        const registration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))
        ]);

        if (cancelled) return;

        if (registration) {
          const isControlled = !!navigator.serviceWorker.controller;
          if (!isControlled && (registration.installing || registration.waiting)) {
            const sw = registration.installing || registration.waiting;
            if (sw) {
              await Promise.race([
                new Promise<void>((resolve) => {
                  sw.addEventListener('statechange', () => {
                    if (sw.state === 'activated') resolve();
                  });
                  if (sw.state === 'activated') resolve();
                }),
                new Promise<void>((resolve) => setTimeout(resolve, 6000))
              ]);
            }
          }
        }

        if (!cancelled) {
          setPhase('downloading');
        }
      } catch {
        if (!cancelled) {
          setPhase('downloading');
        }
      }
    };

    connect();
    return () => { cancelled = true; };
  }, [phase]);

  // Downloading phase - track cache progress
  useEffect(() => {
    if (phase !== 'downloading') return;

    let cancelled = false;
    let pollCount = 0;

    const trackDownload = async () => {
      const timeoutId = setTimeout(() => {
        if (!cancelled) {
          setDownloadProgress(100);
          setPhase('saving');
          setTimeout(() => {
            if (!cancelled) {
              setDownloadProgress(100);
              setPhase('ready');
            }
          }, 600);
        }
      }, 25000);

      const pollInterval = setInterval(async () => {
        if (cancelled) return;
        pollCount++;

        const count = await getTotalCachedCount();
        setCachedCount(count);
        const progress = Math.min((count / CACHE_TOTAL_ESTIMATE) * 100, 99);
        setDownloadProgress(Math.round(progress));

        if (progress >= 25 && !milestone25) setMilestone25(true);
        if (progress >= 50 && !milestone50) setMilestone50(true);
        if (progress >= 75 && !milestone75) setMilestone75(true);

        if (count >= CACHE_TOTAL_ESTIMATE * 0.9 || pollCount > 20) {
          clearInterval(pollInterval);
          clearTimeout(timeoutId);
          if (!cancelled) {
            setDownloadProgress(100);
            setPhase('saving');
            setTimeout(() => {
              if (!cancelled) {
                setPhase('ready');
              }
            }, 800);
          }
        }
      }, 600);

      return () => {
        clearInterval(pollInterval);
        clearTimeout(timeoutId);
      };
    };

    const cleanup = trackDownload();
    return () => {
      cancelled = true;
      cleanup.then(fn => fn());
    };
  }, [phase, getTotalCachedCount, milestone25, milestone50, milestone75]);

  const getStatusMessage = () => {
    if (phase === 'boot') return PHASE_MESSAGES.boot;
    if (phase === 'connecting') return PHASE_MESSAGES.connecting;
    if (phase === 'saving') return isReturningUser ? 'Reloading saved realm...' : PHASE_MESSAGES.saving;
    if (phase === 'ready') return PHASE_MESSAGES.ready;

    const pct = downloadProgress;
    if (pct < 15) return 'Downloading core realm...';
    if (pct < 30) return 'Loading character assets...';
    if (pct < 50) return 'Gathering video lessons...';
    if (pct < 70) return 'Caching battle arenas...';
    if (pct < 85) return 'Loading audio & fonts...';
    return 'Finalizing preparations...';
  };

  const getCategoryIcon = () => {
    const pct = downloadProgress;
    if (pct < 15) return <FileCode className="w-4 h-4" />;
    if (pct < 30) return <Image className="w-4 h-4" />;
    if (pct < 50) return <Film className="w-4 h-4" />;
    if (pct < 70) return <Image className="w-4 h-4" />;
    if (pct < 85) return <Music className="w-4 h-4" />;
    return <PackageCheck className="w-4 h-4" />;
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.75)), url(${exponentiaDark})` }}
    >
      {/* Offline modal */}
      <AlertDialog open={showOfflineModal}>
        <AlertDialogContent className="max-w-sm mx-4 border-destructive/50 bg-background">
          <AlertDialogHeader className="items-center text-center">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <WifiOff className="w-12 h-12 text-destructive mb-2" />
            </motion.div>
            <AlertDialogTitle className="font-orbitron text-lg">Connection Required</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground space-y-3">
              <p>Exponentia needs to download resources before you can play offline.</p>
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/80">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Connect to Wi-Fi or mobile data</span>
                </div>
                <Progress value={offlineCacheProgress} className="h-2 bg-muted/50" />
                <p className="text-xs text-muted-foreground/60">{offlineCacheProgress}% cached</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>

      {/* Background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-primary rounded-full"
            style={{ opacity: phase === 'ready' ? 0.6 : 0.2 }}
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 600),
            }}
            animate={{
              y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 600)],
              opacity: phase === 'ready' ? [0.4, 0.8, 0.4] : [0.1, 0.3, 0.1],
            }}
            transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </div>

      {/* Milestone celebration particles */}
      <AnimatePresence>
        {(milestone25 || milestone50 || milestone75) && phase === 'downloading' && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={`celeb-${i}`}
                className="absolute w-1 h-1 bg-gem rounded-full"
                initial={{ x: '50%', y: '50%', opacity: 1, scale: 0 }}
                animate={{
                  x: `${30 + Math.random() * 40}%`,
                  y: `${20 + Math.random() * 60}%`,
                  opacity: [1, 0],
                  scale: [0, 1.5],
                }}
                transition={{ duration: 1, delay: i * 0.1 }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <motion.div
        className="text-center z-10 w-full max-w-lg px-6 mx-auto flex flex-col items-center justify-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Logo */}
        <motion.div
          className="relative inline-block mb-5"
          animate={phase === 'ready' ? { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] } : { rotateY: [0, 360] }}
          transition={
            phase === 'ready'
              ? { duration: 0.6, ease: 'easeInOut' }
              : { duration: 2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1 }
          }
        >
          <div
            className="text-7xl sm:text-8xl font-orbitron font-black text-primary"
            style={{ filter: 'drop-shadow(0 0 24px hsl(var(--theme-glow) / 0.9)) drop-shadow(0 0 48px hsl(var(--theme-glow) / 0.4))' }}
          >
            E
          </div>
          <Sparkles className="absolute -top-4 -right-4 w-7 h-7 text-gem animate-pulse" />
          <Zap className="absolute -bottom-4 -left-4 w-7 h-7 text-secondary animate-pulse" />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl font-orbitron font-black mb-2 text-glow"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          EXPONENTIA
        </motion.h1>

        <motion.p
          className="text-base sm:text-lg text-muted-foreground font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          The Realm of Exponential Power
        </motion.p>

        <motion.p
          className="text-xs text-muted-foreground/60 mt-1.5 italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          by: Jeemark Naceel Calungsod Alojado
        </motion.p>

        {/* Loading Section */}
        <div className="mt-8 w-full max-w-sm">
          <AnimatePresence mode="wait">
            {/* Boot phase */}
            {phase === 'boot' && (
              <motion.div
                key="boot"
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex gap-1.5 justify-center">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2.5 h-2.5 rounded-full bg-primary"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground/60 font-orbitron">{getStatusMessage()}</p>
              </motion.div>
            )}

            {/* Connecting phase */}
            {phase === 'connecting' && (
              <motion.div
                key="connecting"
                className="space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="flex items-center justify-center gap-2 text-primary"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium font-orbitron">{getStatusMessage()}</span>
                </motion.div>
                <div className="flex gap-1.5 justify-center">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Downloading phase */}
            {phase === 'downloading' && (
              <motion.div
                key="downloading"
                className="space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Status with category icon */}
                <motion.div
                  className="flex items-center justify-center gap-2 text-primary"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Download className="w-4 h-4 animate-bounce" />
                  <span className="text-sm font-medium font-orbitron">{getStatusMessage()}</span>
                </motion.div>

                {/* Main progress bar */}
                <div className="relative">
                  <Progress value={downloadProgress} className="h-3.5 bg-muted/40 rounded-full overflow-hidden" />
                  <motion.div
                    className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
                    animate={{ opacity: [0, 0.4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div className="h-full w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                  </motion.div>
                </div>

                {/* Progress info row */}
                <div className="flex items-center justify-between text-xs text-muted-foreground/70">
                  <div className="flex items-center gap-1.5">
                    {getCategoryIcon()}
                    <span>{cachedCount} / {CACHE_TOTAL_ESTIMATE} files</span>
                  </div>
                  <span className="font-orbitron font-medium text-primary">{Math.round(downloadProgress)}%</span>
                </div>

                {/* Milestone badges */}
                <div className="flex justify-center gap-2">
                  {[
                    { at: 25, reached: milestone25, label: 'I' },
                    { at: 50, reached: milestone50, label: 'II' },
                    { at: 75, reached: milestone75, label: 'III' },
                  ].map(({ at, reached, label }) => (
                    <motion.div
                      key={at}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-orbitron font-bold border transition-all duration-500 ${
                        reached
                          ? 'bg-gem/20 border-gem/50 text-gem'
                          : 'bg-muted/20 border-muted/30 text-muted-foreground/40'
                      }`}
                      animate={reached ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      {reached ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-3 h-3 rounded-full border border-current/30" />}
                      <span>{label}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Install button during download */}
                {installPrompt && !installDismissed && !isStandalone && downloadProgress > 30 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <button
                      onClick={handleInstall}
                      className="mx-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-gem/20 border border-gem/40 text-gem text-xs font-orbitron font-bold hover:bg-gem/30 transition-colors"
                    >
                      <HardDrive className="w-3.5 h-3.5" />
                      Install for Offline Play
                    </button>
                  </motion.div>
                )}

                {/* Network indicator */}
                {isStandalone && (
                  <motion.div
                    className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Wifi className="w-3 h-3" />
                    <span>Downloading for offline play</span>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Saving phase */}
            {phase === 'saving' && (
              <motion.div
                key="saving"
                className="space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="flex items-center justify-center gap-2 text-gem"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Save className="w-5 h-5" />
                  <span className="text-sm font-medium font-orbitron">
                    {isReturningUser ? 'Reloading saved realm...' : 'Sealing the realm...'}
                  </span>
                </motion.div>

                <div className="relative">
                  <Progress value={downloadProgress} className="h-3.5 bg-muted/40" />
                  <motion.div
                    className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <div className="h-full w-full bg-gradient-to-r from-transparent via-gem/30 to-transparent" />
                  </motion.div>
                </div>

                <div className="flex justify-center">
                  <motion.div
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gem/10 border border-gem/30"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-gem" />
                    <span className="text-xs text-gem font-orbitron font-bold">{Math.round(downloadProgress)}%</span>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Ready phase */}
            {phase === 'ready' && (
              <motion.div
                key="ready"
                className="space-y-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  className="flex items-center justify-center gap-2 text-gem"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <Sword className="w-5 h-5" />
                  <span className="text-base font-bold font-orbitron text-glow-gold">{getStatusMessage()}</span>
                </motion.div>

                <div className="flex justify-center">
                  <Progress value={100} className="h-3.5 bg-muted/40" />
                </div>

                {/* Confirmation message */}
                <motion.p
                  className="text-xs text-muted-foreground/70 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {isReturningUser
                    ? 'Your progress has been saved. Ready to continue your adventure!'
                    : 'All resources loaded! Install to play offline anytime.'}
                </motion.p>

                {/* Install button */}
                {installPrompt && !installDismissed && !isStandalone && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <button
                      onClick={handleInstall}
                      className="mx-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-gem/20 border border-gem/40 text-gem text-xs font-orbitron font-bold hover:bg-gem/30 transition-colors"
                    >
                      <HardDrive className="w-3.5 h-3.5" />
                      Install to Play Offline Anytime
                    </button>
                  </motion.div>
                )}

                {/* Enter button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <button
                    onClick={navigateToGame}
                    className="mx-auto flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-orbitron font-bold hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
                  >
                    <Sword className="w-4 h-4" />
                    Enter the Realm
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <InstallHelpButton />
    </div>
  );
};

export default Index;

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const pendingCount = useGameStore(state => state.pendingSyncResults.length);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[200] bg-amber-600/95 backdrop-blur-sm text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium shadow-lg"
        >
          <WifiOff className="w-4 h-4" />
          <span>You're offline. Quiz results will sync when reconnected.</span>
          {pendingCount > 0 && (
            <span className="bg-amber-800/60 text-amber-100 text-xs px-2 py-0.5 rounded-full ml-1">
              {pendingCount} pending
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
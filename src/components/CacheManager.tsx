import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, HardDrive } from 'lucide-react';

interface CacheStats {
  entryCount: number;
  estimatedSize: string;
}

async function getCacheStats(): Promise<CacheStats> {
  if (!('caches' in window)) return { entryCount: 0, estimatedSize: '0 B' };
  try {
    const cacheNames = await caches.keys();
    let totalEntries = 0;
    let totalSize = 0;
    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      totalEntries += keys.length;
      for (const req of keys) {
        try {
          const resp = await cache.match(req);
          if (resp) {
            const blob = await resp.blob();
            totalSize += blob.size;
          }
        } catch { /* skip */ }
      }
    }
    return { entryCount: totalEntries, estimatedSize: formatBytes(totalSize) };
  } catch {
    return { entryCount: 0, estimatedSize: '0 B' };
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function CacheManager() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [clearing, setClearing] = useState(false);

  const refresh = useCallback(async () => {
    const s = await getCacheStats();
    setStats(s);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleClear = async () => {
    setClearing(true);
    try {
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map(n => caches.delete(n)));
      }
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }
      await refresh();
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <HardDrive className="w-4 h-4" />
          <span>Cached: {stats ? `${stats.entryCount} files (${stats.estimatedSize})` : 'Loading...'}</span>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} className="h-7 text-xs">
          Refresh
        </Button>
      </div>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleClear}
        disabled={clearing}
        className="w-full gap-2"
      >
        <Trash2 className="w-4 h-4" />
        {clearing ? 'Clearing...' : 'Clear Cache & Reload'}
      </Button>
    </div>
  );
}
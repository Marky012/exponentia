import { useGameStore } from '@/store/gameStore';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

export const GemDisplay = ({ className }: { className?: string }) => {
  const laws = useGameStore((state) => state.laws);
  const gemsEarned = laws.filter((law) => law.gemEarned).length;
  const totalGems = laws.length;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Sparkles className="w-6 h-6 text-gem animate-pulse" />
      <div className="flex items-center gap-1">
        {Array.from({ length: totalGems }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-4 h-4 rounded-full border-2",
              index < gemsEarned
                ? "bg-gem border-gem shadow-[0_0_10px_hsl(var(--gem-glow))] animate-pulseGlow"
                : "bg-muted border-muted-foreground/30"
            )}
          />
        ))}
      </div>
      <span className="text-sm font-medium font-orbitron">
        {gemsEarned}/{totalGems}
      </span>
    </div>
  );
};

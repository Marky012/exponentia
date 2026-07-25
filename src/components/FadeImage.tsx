import { useState, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface FadeImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackClassName?: string;
}

export function FadeImage({ className, style, fallbackClassName, onLoad, ...props }: FadeImageProps) {
  const [decoded, setDecoded] = useState(false);

  return (
    <>
      {!decoded && (
        <div
          className={cn(
            'animate-pulse bg-primary/10 rounded',
            fallbackClassName
          )}
          style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
        />
      )}
      <img
        className={cn(
          'transition-opacity duration-500',
          decoded ? 'opacity-100' : 'opacity-0',
          className
        )}
        onLoad={(e) => {
          const img = e.currentTarget;
          const p = img.decode ? img.decode() : Promise.resolve();
          p.then(() => setDecoded(true)).catch(() => setDecoded(true));
          onLoad?.(e);
        }}
        style={style}
        {...props}
      />
    </>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface YouTubeVideoProps {
  videoId: string;
  title?: string;
  className?: string;
}

// Map of law IDs to YouTube video IDs for exponential laws tutorials
export const lawVideoMap: Record<string, string> = {
  'product': 'dQw4w9WgXcQ', // Replace with actual educational video IDs
  'quotient': 'dQw4w9WgXcQ',
  'power': 'dQw4w9WgXcQ',
  'zero': 'dQw4w9WgXcQ',
  'negative': 'dQw4w9WgXcQ',
  'product-power': 'dQw4w9WgXcQ',
  'quotient-power': 'dQw4w9WgXcQ',
  'identity': 'dQw4w9WgXcQ',
};

// Actual educational video links for each law
export const educationalVideos: Record<string, { videoId: string; title: string }> = {
  'product': { 
    videoId: 'kITJ6qH7jS0', // Khan Academy: Multiplying monomials
    title: 'Product of Powers - Khan Academy'
  },
  'quotient': { 
    videoId: '6WMZ7J0wwMI', // Khan Academy: Dividing monomials
    title: 'Quotient of Powers - Khan Academy'
  },
  'power': { 
    videoId: 'dFnKbZdXvKs', // Power of a power
    title: 'Power of a Power - Math Tutorial'
  },
  'zero': { 
    videoId: 'r0_mi8ngNnM', // Zero exponent
    title: 'Zero Exponent Rule Explained'
  },
  'negative': { 
    videoId: 'Tqpcku0hrPU', // Negative exponents
    title: 'Negative Exponents Made Easy'
  },
  'product-power': { 
    videoId: 'K_OI9LA54AA', // Power of a product
    title: 'Power of a Product Rule'
  },
  'quotient-power': { 
    videoId: 'X6zD3SoAIV4', // Power of a quotient
    title: 'Power of a Quotient Rule'
  },
  'identity': { 
    videoId: 'mvOkMYCygps', // Identity exponent
    title: 'Identity Exponent Rule'
  },
};

const YouTubeVideo = ({ videoId, title, className = '' }: YouTubeVideoProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const handleLoadVideo = () => {
    setShowVideo(true);
    setIsLoaded(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-lg overflow-hidden bg-muted/30 border border-border ${className}`}
    >
      {!showVideo ? (
        <div 
          className="relative cursor-pointer group"
          onClick={handleLoadVideo}
        >
          {/* Thumbnail */}
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <img 
              src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
              alt={title || 'Video thumbnail'}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
            
            {/* Play button */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                <Play className="w-8 h-8 md:w-10 md:h-10 text-white ml-1" fill="white" />
              </div>
            </motion.div>
          </div>
          
          {/* Title overlay */}
          {title && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
              <p className="text-white text-sm font-medium truncate">{title}</p>
              <p className="text-white/70 text-xs flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                Click to watch tutorial
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&rel=0`}
            title={title || 'YouTube video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      )}
    </motion.div>
  );
};

export default YouTubeVideo;

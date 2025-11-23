import exponentiaLight from '@/assets/exponentia-light.png';
import exponentiaDark from '@/assets/exponentia-dark.png';

/**
 * Determines which background image to use based on gem collection progress.
 * As players collect more gems, the world transitions from dark back to light.
 * 
 * @param gemsCollected - Number of gems the player has collected (0-8)
 * @returns The appropriate background image
 */
export const getExponentiaBackground = (gemsCollected: number): string => {
  // 0-2 gems: Fully dark (Exponentia is dying)
  if (gemsCollected <= 2) {
    return exponentiaDark;
  }
  
  // 3-5 gems: Still dark (but hope is growing)
  if (gemsCollected <= 5) {
    return exponentiaDark;
  }
  
  // 6-7 gems: Transition to light (world is recovering)
  if (gemsCollected <= 7) {
    return exponentiaLight;
  }
  
  // 8 gems: Fully restored (victory!)
  return exponentiaLight;
};

/**
 * Gets the overlay opacity based on gem progress.
 * Reduces darkness as more gems are collected.
 */
export const getBackgroundOverlay = (gemsCollected: number): number => {
  if (gemsCollected <= 2) return 0.8; // Very dark
  if (gemsCollected <= 5) return 0.7; // Dark
  if (gemsCollected <= 7) return 0.5; // Medium
  return 0.4; // Light
};

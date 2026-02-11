// Background music manager for looping game music

class BackgroundMusic {
  private audio: HTMLAudioElement | null = null;
  private enabled: boolean = true;
  private volume: number = 0.3;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedEnabled = localStorage.getItem('musicEnabled');
      const savedVolume = localStorage.getItem('musicVolume');
      this.enabled = savedEnabled !== null ? savedEnabled === 'true' : true;
      this.volume = savedVolume !== null ? parseFloat(savedVolume) : 0.3;
    }
  }

  private initAudio() {
    if (!this.audio) {
      this.audio = new Audio('/audio/Crystal_Theorems.mp3');
      this.audio.loop = true;
      this.audio.volume = this.volume;
    }
    return this.audio;
  }

  play() {
    if (!this.enabled) return;
    const audio = this.initAudio();
    audio.play().catch(() => {
      // Autoplay blocked - will retry on user interaction
    });
  }

  pause() {
    this.audio?.pause();
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    localStorage.setItem('musicEnabled', String(enabled));
    if (enabled) {
      this.play();
    } else {
      this.pause();
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('musicVolume', String(this.volume));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
  }

  isEnabled() {
    return this.enabled;
  }

  getVolume() {
    return this.volume;
  }

  // Call on first user interaction to bypass autoplay restrictions
  tryResume() {
    if (this.enabled && this.audio?.paused) {
      this.play();
    }
  }
}

export const backgroundMusic = new BackgroundMusic();

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  lawTested: string;
}

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

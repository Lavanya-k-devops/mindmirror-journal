export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string; // ISO string for portable display
}

export interface ReflectionCompass {
  whatHappened: string;
  whatImFeeling: string;
  whatsBotheringMe: string;
  whatIWant: string;
  whatICanControl: string;
  nextStep: string;
  generatedAt: string;
}

export interface JournalLocation {
  latitude: number;
  longitude: number;
  label?: string | null;
  accuracy?: number | null; // accuracy in meters
  capturedAt: string; // ISO string
}

export interface JournalInteraction {
  id: string;
  userId: string;
  title: string;
  summary: string;
  tags: string[];
  messages: ChatMessage[];
  reflectionPrompt?: string | null;
  reflectionCompass?: ReflectionCompass | null;
  location?: JournalLocation | null;
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
}

export interface GeminiChatResponse {
  reply: string;
  summary: string;
  tags: string[];
  reflectionPrompt?: string | null;
  reflectionCompass?: ReflectionCompass | null;
  error?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface InsightTheme {
  theme: string;
  description: string;
}

export interface JournalInsightsSynthesis {
  timeframe: string;
  mindsetSummary: string;
  coreThemes: InsightTheme[];
  growthIndicators: string[];
  ongoingInquiries: string[];
  suggestedForwardPrompt: string;
  totalReflectionsAnalyzed: number;
  generatedAt: string;
}

export interface JournalStats {
  totalReflections: number;
  totalMessages: number;
  totalWordsEstimated: number;
  locationsCount: number;
  compassesCount: number;
  topTags: Array<{ tag: string; count: number }>;
}


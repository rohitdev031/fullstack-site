

export type ResponseQuality = 'Fast' | 'Balanced' | 'Best';

export interface Source {
  title: string;
  url: string;
  domain?: string;
  icon?: string;
  snippet?: string;
}

export interface AIResponse {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  sources?: Source[];
}

export interface ComparisonResult {
  modelName: string;
  response: string;
  metrics: { label: string; value: string; color: string }[];
  sources?: Source[];
}

export interface CompareAnalysisData {
  keyTakeaways: string[];
  agreements: { label: string; value: 'High' | 'Medium' | 'Low'; percent: string; color: string; width: string }[];
  bestAnswer: { modelName: string; reason: string };
}

export interface CompareResponse {
  results: ComparisonResult[];
  analysis: CompareAnalysisData;
}

export interface VerificationClaim {
  text: string;
  status: 'Correct' | 'Partially Correct' | 'Incorrect';
  details: string;
  iconName: string;
  color: string;
}

export interface VerificationIssue {
  priority: 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  iconName: string;
  colorClass: string;
  bgClass: string;
}

export interface VerificationData {
  originalAnswer: {
    model: string;
    text: string;
    sourcesCount: number;
  };
  metrics: {
    totalClaims: number;
    correct: number;
    partiallyCorrect: number;
    incorrect: number;
    accuracy: number;
  };
  claims: VerificationClaim[];
  keyIssues: VerificationIssue[];
  recommendations: string[];
  settings: {
    verificationModel: string;
    webSearch: string;
    factCheckingLevel: string;
  };
  sources?: Source[];
}

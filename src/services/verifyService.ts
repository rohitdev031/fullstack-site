import { apiClient } from './api';

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
  sources?: {
    title: string;
    url: string;
    domain: string;
    icon: string;
  }[];
}

const MOCK_VERIFICATION_DATA: VerificationData = {
  originalAnswer: {
    model: 'Gemini 1.5 Pro',
    text: 'Improving productivity while working from home requires a combination of environment design, routine management, and focus strategies. Key approaches include creating a dedicated workspace, establishing a consistent routine, using time blocking techniques, minimizing digital distractions, taking regular breaks, and setting clear boundaries between work and personal life.',
    sourcesCount: 5
  },
  metrics: {
    totalClaims: 10,
    correct: 7,
    partiallyCorrect: 2,
    incorrect: 1,
    accuracy: 80
  },
  claims: [
    { text: 'Creating a dedicated workspace improves productivity', status: 'Correct', details: 'Strong evidence from multiple studies', iconName: 'CheckCircle2', color: 'text-emerald-500' },
    { text: 'Consistent routines help maintain productivity', status: 'Correct', details: 'Well-supported by research', iconName: 'CheckCircle2', color: 'text-emerald-500' },
    { text: 'Time blocking techniques significantly increase productivity', status: 'Partially Correct', details: 'Effective for many, but varies by individual', iconName: 'AlertTriangle', color: 'text-amber-500' },
    { text: 'Digital distractions reduce productivity', status: 'Correct', details: 'Strong scientific consensus', iconName: 'CheckCircle2', color: 'text-emerald-500' },
    { text: 'Taking regular breaks improves long-term productivity', status: 'Partially Correct', details: 'Depends on break frequency and type', iconName: 'AlertTriangle', color: 'text-amber-500' },
    { text: 'Setting boundaries between work and personal life is important', status: 'Correct', details: 'Well-established best practice', iconName: 'CheckCircle2', color: 'text-emerald-500' },
    { text: 'Working longer hours from home leads to higher productivity', status: 'Incorrect', details: 'Overtime often reduces productivity', iconName: 'XCircle', color: 'text-red-500' },
    { text: 'Environment design affects focus and productivity', status: 'Correct', details: 'Supported by environmental psychology', iconName: 'CheckCircle2', color: 'text-emerald-500' },
    { text: 'Minimizing context switching improves productivity', status: 'Correct', details: 'Strong research support', iconName: 'CheckCircle2', color: 'text-emerald-500' },
    { text: 'All productivity techniques work equally for everyone', status: 'Partially Correct', details: 'Effectiveness varies by individual', iconName: 'AlertTriangle', color: 'text-amber-500' }
  ],
  keyIssues: [
    { priority: 'High', title: 'Overtime reduces productivity', description: 'Research shows overtime often leads to decreased productivity and burnout.', iconName: 'XCircle', colorClass: 'text-red-500', bgClass: 'bg-red-50' },
    { priority: 'Medium', title: 'Individual variation not addressed', description: 'Answer suggests one-size-fits-all approach when effectiveness varies by person.', iconName: 'AlertTriangle', colorClass: 'text-amber-500', bgClass: 'bg-amber-50' }
  ],
  recommendations: [
    'Consider adding individual differences',
    'Include flexibility in approach',
    'Add evidence for time blocking benefits'
  ],
  settings: {
    verificationModel: 'GPT-4o',
    webSearch: 'Enabled',
    factCheckingLevel: 'Standard'
  }
};

export const verifyService = {
  getVerificationResults: async (options?: { webSearchEnabled?: boolean }): Promise<VerificationData> => {
    const responseData = { ...MOCK_VERIFICATION_DATA };
    
    if (options?.webSearchEnabled) {
      responseData.sources = [
        { title: 'The Eiffel Tower - Official Website', url: 'https://toureiffel.paris', domain: 'toureiffel.paris', icon: 'ShieldCheck' },
        { title: 'Wikipedia - Eiffel Tower', url: 'https://en.wikipedia.org', domain: 'wikipedia.org', icon: 'W' },
        { title: 'Paris History Archives', url: 'https://paris.fr', domain: 'paris.fr', icon: 'FileText' }
      ];
    }
    
    return apiClient.get('/api/verify/results', responseData);
  }
};

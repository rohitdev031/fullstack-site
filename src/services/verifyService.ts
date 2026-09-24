import { aiService } from '@/services/ai/aiService';
import type { VerificationData } from '@/services/ai/types';

export const verifyService = {
  getVerificationResults: async (options?: { 
    messageId?: string;
    compareResultId?: number;
    webSearchEnabled?: boolean;
    signal?: AbortSignal 
  }): Promise<VerificationData> => {
    // Delegate to centralized AI Service Layer
    return aiService.runVerification(options);
  }
};


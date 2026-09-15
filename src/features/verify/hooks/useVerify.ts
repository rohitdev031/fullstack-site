import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { verifyService } from '@/services/verifyService';
import type { VerificationData } from '@/services/ai/types';

export function useVerify() {
  const location = useLocation();
  const answerToVerify = location.state?.answerToVerify as string | undefined;

  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [mockVerificationData, setMockVerificationData] = useState<VerificationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClaimIndex, setSelectedClaimIndex] = useState<number | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await verifyService.getVerificationResults({ 
          webSearchEnabled, 
          signal: abortController.signal 
        });
        
        if (abortController.signal.aborted) return;
        
        // If an answer was passed via navigation state, override the mock original answer
        if (answerToVerify) {
          data.originalAnswer.text = answerToVerify;
        }
        setMockVerificationData(data);
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Request aborted');
          return;
        }
        console.error("Failed to fetch verification results:", err);
        setError("Unable to run verification at this time. Please try again later.");
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchData();

    return () => {
      abortController.abort();
    };
  }, [webSearchEnabled, answerToVerify]);

  return {
    webSearchEnabled,
    setWebSearchEnabled,
    mockVerificationData,
    isLoading,
    error,
    selectedClaimIndex,
    setSelectedClaimIndex
  };
}


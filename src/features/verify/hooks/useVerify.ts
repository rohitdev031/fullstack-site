import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { verifyService, type VerificationData } from '@/services/verifyService';

export function useVerify() {
  const location = useLocation();
  const answerToVerify = location.state?.answerToVerify as string | undefined;

  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [mockVerificationData, setMockVerificationData] = useState<VerificationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClaimIndex, setSelectedClaimIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await verifyService.getVerificationResults({ webSearchEnabled });
        // If an answer was passed via navigation state, override the mock original answer
        if (answerToVerify) {
          data.originalAnswer.text = answerToVerify;
        }
        setMockVerificationData(data);
      } catch (err) {
        console.error("Failed to fetch verification results:", err);
        setError("Unable to run verification at this time. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [answerToVerify, webSearchEnabled]);

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

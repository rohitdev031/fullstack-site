import { useVerify } from './hooks/useVerify';
import { VerifyOriginalAnswer } from './components/VerifyOriginalAnswer';
import { VerifyControls } from './components/VerifyControls';
import { VerifyMobileDashboard } from './components/VerifyMobileDashboard';
import { VerifyResultsTable } from './components/VerifyResultsTable';
import { VerifySidebar } from './components/VerifySidebar';
import { AlertCircle } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { AVAILABLE_MODELS } from '@/features/ask/types';

export function VerifyView() {
  const { currentModel } = useAppContext();
  const selectedModelObj = AVAILABLE_MODELS.find(m => m.id === currentModel) || AVAILABLE_MODELS[0];
  const { 
    webSearchEnabled, 
    setWebSearchEnabled, 
    mockVerificationData, 
    isLoading,
    error,
    selectedClaimIndex,
    setSelectedClaimIndex
  } = useVerify();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full pt-32 text-muted-foreground animate-pulse">
        Running verification...
      </div>
    );
  }

  if (error || !mockVerificationData) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-32 gap-4">
        <AlertCircle className="w-10 h-10 text-red-500/80" />
        <p className="text-muted-foreground font-medium">{error || "No verification data available."}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] w-full mx-auto flex flex-col xl:flex-row gap-6 pb-20 md:pb-12 h-full overflow-y-auto scrollbar-hide pr-2">
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col shrink-0 mt-2">
          <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2 tracking-tight">Verify</h1>
          <p className="text-muted-foreground text-[14px] md:text-[15px]">Get independent verification and fact-checking for any answer.</p>
        </div>

        <VerifyOriginalAnswer 
          originalAnswer={mockVerificationData.originalAnswer} 
          sources={mockVerificationData.sources}
          claims={mockVerificationData.claims}
          selectedClaimIndex={selectedClaimIndex}
          onClaimSelect={setSelectedClaimIndex}
        />
        
        <VerifyControls 
          webSearchEnabled={webSearchEnabled} 
          setWebSearchEnabled={setWebSearchEnabled} 
        />
        
        <VerifyMobileDashboard 
          metrics={mockVerificationData.metrics}
          claims={mockVerificationData.claims}
          keyIssues={mockVerificationData.keyIssues}
          recommendations={mockVerificationData.recommendations}
          settings={mockVerificationData.settings}
          modelName={selectedModelObj.name}
        />
        
        <VerifyResultsTable 
          metrics={mockVerificationData.metrics} 
          claims={mockVerificationData.claims} 
          selectedClaimIndex={selectedClaimIndex}
          onClaimSelect={setSelectedClaimIndex}
        />

      </div>

      <VerifySidebar 
        metrics={mockVerificationData.metrics}
        keyIssues={mockVerificationData.keyIssues}
        recommendations={mockVerificationData.recommendations}
        settings={mockVerificationData.settings}
      />
      
    </div>
  );
}

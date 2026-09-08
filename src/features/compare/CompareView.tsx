import { useAppContext } from '@/context/AppContext';
import { useCompare } from './hooks/useCompare';
import { CompareControls } from './components/CompareControls';
import { ComparisonGrid } from './components/ComparisonGrid';
import { CompareAnalysis } from './components/CompareAnalysis';

export function CompareView() {
  const { webSearchEnabled, setWebSearchEnabled } = useAppContext();
  const {
    prompt,
    setPrompt,
    isComparing,
    allAvailableModels,
    selectedModels,
    results,
    analysis,
    error,
    modelFetchError,
    handleCompare,
    removeModel,
    addModel,
    swapModel
  } = useCompare();

  return (
    <div className="max-w-[1600px] w-full mx-auto flex flex-col gap-6 pb-20 md:pb-12 h-full overflow-y-auto scrollbar-hide pr-2">
      {modelFetchError ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Initialization Failed</h3>
          <p className="text-muted-foreground text-[15px] max-w-md">{modelFetchError}</p>
        </div>
      ) : (
        <>
          <CompareControls
            prompt={prompt}
            setPrompt={setPrompt}
            allAvailableModels={allAvailableModels}
            selectedModels={selectedModels}
            removeModel={removeModel}
            addModel={addModel}
            swapModel={swapModel}
            webSearchEnabled={webSearchEnabled}
            setWebSearchEnabled={setWebSearchEnabled}
            handleCompare={handleCompare}
          />

          {error ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Comparison Failed</h3>
              <p className="text-muted-foreground text-[15px] max-w-md">{error}</p>
            </div>
          ) : isComparing ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
           <div className="flex items-center gap-2.5 text-indigo-500">
             <span className="w-3.5 h-3.5 rounded-full bg-indigo-500/80 animate-bounce"></span>
             <span className="w-3.5 h-3.5 rounded-full bg-indigo-500/80 animate-bounce delay-75"></span>
             <span className="w-3.5 h-3.5 rounded-full bg-indigo-500/80 animate-bounce delay-150"></span>
           </div>
           <p className="text-muted-foreground font-semibold">Generating comparisons from {selectedModels.length} models...</p>
        </div>
      ) : (
        <>
          <ComparisonGrid selectedModels={selectedModels} results={results} />
          {analysis && <CompareAnalysis analysis={analysis} />}
        </>
      )}
        </>
      )}
    </div>
  );
}

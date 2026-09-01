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
    selectedModels,
    results,
    handleCompare,
    removeModel,
    addModel
  } = useCompare();

  return (
    <div className="max-w-[1600px] w-full mx-auto flex flex-col gap-6 pb-20 md:pb-12 h-full overflow-y-auto scrollbar-hide pr-2">
      <CompareControls 
        prompt={prompt}
        setPrompt={setPrompt}
        selectedModels={selectedModels}
        removeModel={removeModel}
        addModel={addModel}
        webSearchEnabled={webSearchEnabled}
        setWebSearchEnabled={setWebSearchEnabled}
        handleCompare={handleCompare}
      />

      {isComparing ? (
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
          <CompareAnalysis selectedModels={selectedModels} />
        </>
      )}
    </div>
  );
}

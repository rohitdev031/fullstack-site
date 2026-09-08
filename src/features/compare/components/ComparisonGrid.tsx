import type { AIModel, ComparisonResult } from '@/services/compareService';
import { ComparisonCard } from './ComparisonCard';
import { getIcon } from './iconMap';

interface ComparisonGridProps {
  selectedModels: AIModel[];
  results: ComparisonResult[];
}

export function ComparisonGrid({ selectedModels, results }: ComparisonGridProps) {
  return (
    <div className={`grid ${selectedModels.length === 2 ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2'} ${selectedModels.length === 3 ? 'md:grid-cols-3' : ''} ${selectedModels.length === 4 ? 'md:grid-cols-4' : ''} gap-3 md:gap-6 shrink-0`}>
      {selectedModels.map((model, i) => {
        const result = results.find(r => r.modelName === model.name);
        const mockContent = result ? (
          <p className="whitespace-pre-wrap">{result.response}</p>
        ) : (
          <>
            <p className="mb-4">Improving productivity while working from home requires a combination of environment design, routine management, and focus strategies.</p>
            <h4 className="font-bold mb-3 text-foreground">Key Strategies</h4>
            <ol className="list-decimal pl-5 space-y-2 mb-4">
              <li className="text-foreground"><strong>Create a dedicated workspace</strong></li>
              <li className="text-foreground"><strong>Establish a consistent routine</strong></li>
              <li className="text-foreground"><strong>Use time blocking techniques</strong></li>
              <li className="text-foreground"><strong>Minimize digital distractions</strong></li>
              <li className="text-foreground"><strong>Take regular breaks</strong></li>
              <li className="text-foreground"><strong>Set clear boundaries</strong></li>
            </ol>
            <p className="mt-4">In summary, structure, discipline, and a distraction-free environment are key to maintaining high productivity at home.</p>
          </>
        );

        const rawMockText = `Improving productivity while working from home requires a combination of environment design, routine management, and focus strategies.

Key Strategies
1. Create a dedicated workspace
2. Establish a consistent routine
3. Use time blocking techniques
4. Minimize digital distractions
5. Take regular breaks
6. Set clear boundaries

In summary, structure, discipline, and a distraction-free environment are key to maintaining high productivity at home.`;

        return (
          <ComparisonCard
            key={model.name}
            model={model.name}
            icon={getIcon(model.iconName)}
            match={i === 1 ? "Excellent match" : "Good match"}
            matchColor={i === 1 ? "text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300" : "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400"}
            content={mockContent}
            rawContent={result?.response || rawMockText}
            sources={result?.sources || []}
            className={i >= 2 ? "hidden md:flex" : ""}
          />
        );
      })}
    </div>
  );
}

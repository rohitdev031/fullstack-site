import { useState, useEffect } from 'react';
import { compareService } from '@/services/compareService';
import type { AIModel, ComparisonResult } from '@/services/compareService';

export function useCompare() {
  const [prompt, setPrompt] = useState('What are the most effective strategies for improving productivity while working from home?');
  const [isComparing, setIsComparing] = useState(false);
  const [allAvailableModels, setAllAvailableModels] = useState<AIModel[]>([]);
  const [selectedModels, setSelectedModels] = useState<AIModel[]>([]);
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [analysis, setAnalysis] = useState<any>(null); // Ideally we'd import CompareAnalysisData type, but 'any' is okay or we can import it
  
  useEffect(() => {
    const fetchModels = async () => {
      const models = await compareService.getAvailableModels();
      setAllAvailableModels(models);
      setSelectedModels(models.slice(0, 3));
    };
    fetchModels();
  }, []);

  const handleCompare = async () => {
    setIsComparing(true);
    const response = await compareService.comparePrompt(prompt, selectedModels.map(m => m.name));
    setResults(response.results);
    setAnalysis(response.analysis);
    setIsComparing(false);
  };

  const removeModel = (modelName: string) => {
    setSelectedModels(prev => prev.filter(m => m.name !== modelName));
  };

  const addModel = () => {
    if (selectedModels.length >= 4) return;
    const unselected = allAvailableModels.find(m => !selectedModels.find(sm => sm.name === m.name));
    if (unselected) {
      setSelectedModels(prev => [...prev, unselected]);
    }
  };

  return {
    prompt,
    setPrompt,
    isComparing,
    allAvailableModels,
    selectedModels,
    results,
    analysis,
    handleCompare,
    removeModel,
    addModel
  };
}

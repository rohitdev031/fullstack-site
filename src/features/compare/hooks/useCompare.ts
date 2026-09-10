import { useState, useEffect } from 'react';
import { compareService } from '@/services/compareService';
import type { AIModel, ComparisonResult, CompareAnalysisData } from '@/services/compareService';

import { useAppContext } from '@/context/AppContext';

export function useCompare() {
  const { webSearchEnabled } = useAppContext();
  const [prompt, setPrompt] = useState('What are the most effective strategies for improving productivity while working from home?');
  const [isComparing, setIsComparing] = useState(false);
  const [allAvailableModels, setAllAvailableModels] = useState<AIModel[]>([]);
  const [selectedModels, setSelectedModels] = useState<AIModel[]>([]);
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [analysis, setAnalysis] = useState<CompareAnalysisData | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [modelFetchError, setModelFetchError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setModelFetchError(null);
        const models = await compareService.getAvailableModels();
        setAllAvailableModels(models);
        setSelectedModels(models.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch available models", err);
        setModelFetchError("Failed to load models. Please refresh the page.");
      }
    };
    fetchModels();
  }, []);

  const handleCompare = async () => {
    if (isComparing || !prompt.trim() || selectedModels.length === 0) return;
    
    setIsComparing(true);
    setError(null);
    try {
      const response = await compareService.comparePrompt(prompt, selectedModels.map(m => m.name), { webSearchEnabled });
      setResults(response.results);
      setAnalysis(response.analysis);
    } catch (err) {
      setError("An error occurred while comparing the models. Please try again.");
      console.error(err);
    } finally {
      setIsComparing(false);
    }
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

  const swapModel = (index: number, newModelName: string) => {
    setSelectedModels(prev => {
      const newModel = allAvailableModels.find(m => m.name === newModelName);
      if (!newModel) return prev;
      
      const updated = [...prev];
      const existingIndex = updated.findIndex(m => m.name === newModelName);
      
      if (existingIndex !== -1 && existingIndex !== index) {
        // If the model is already selected somewhere else, swap their positions
        updated[existingIndex] = prev[index];
        updated[index] = newModel;
      } else {
        // Otherwise just replace the current slot
        updated[index] = newModel;
      }
      return updated;
    });
  };

  return {
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
  };
}

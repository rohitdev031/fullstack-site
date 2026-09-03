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
  
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const models = await compareService.getAvailableModels();
        setAllAvailableModels(models);
        setSelectedModels(models.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch available models", err);
      }
    };
    fetchModels();
  }, []);

  const handleCompare = async () => {
    if (!prompt.trim() || selectedModels.length === 0) return;
    
    setIsComparing(true);
    setError(null);
    try {
      const response = await compareService.comparePrompt(prompt, selectedModels.map(m => m.name));
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
    handleCompare,
    removeModel,
    addModel,
    swapModel
  };
}

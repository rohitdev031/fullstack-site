import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { chatService } from '@/services/chat/chatService';
import type { Message, ResponseQuality } from '../types';
import type { AetherFile } from '@/services/files/fileService';

export function useAskChat() {
  const { 
    currentChatId, setCurrentChatId, 
    currentModel, setCurrentModel, 
    webSearchEnabled, setWebSearchEnabled,
    setHistory
  } = useAppContext();

  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachedFile, setAttachedFile] = useState<File | AetherFile | null>(null);
  const [responseQuality, setResponseQuality] = useState<ResponseQuality>('Balanced');
  const [fileAccept, setFileAccept] = useState<string>('*/*');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // We use state for isGenerating so it's exposed to the UI
  const [isGeneratingState, setIsGeneratingState] = useState(false);
  const activeChatIdRef = useRef(currentChatId);
  const chatAbortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    activeChatIdRef.current = currentChatId;
    
    // If the user switches chats, cancel any in-flight generation for the previous chat
    if (chatAbortControllerRef.current) {
      chatAbortControllerRef.current.abort();
    }
    
    if (currentChatId === null) {
      setMessages([]);
    }
  }, [currentChatId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chatAbortControllerRef.current) {
        chatAbortControllerRef.current.abort();
      }
    };
  }, []);

  // Fetch history when currentChatId changes
  useEffect(() => {
    if (currentChatId === null) {
      return;
    }

    let isActive = true;

    const loadOldChat = async () => {
      try {
        const oldMessages = await chatService.getChatMessages(currentChatId);
        if (isActive) {
          setMessages(oldMessages as Message[]);
          
          // Restore the model used in this conversation
          const lastAiMsg = [...oldMessages].reverse().find(m => m.role === 'ai' && m.model_used);
          if (lastAiMsg && lastAiMsg.model_used) {
            setCurrentModel(lastAiMsg.model_used as ModelId);
          }
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
        if (isActive) {
          setMessages([{
            id: Date.now().toString(),
            role: 'ai',
            content: 'Failed to load chat history. Please try again or start a new chat.',
          }]);
        }
      }
    };

    loadOldChat();

    return () => {
      isActive = false;
    };
  }, [currentChatId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachedFile(e.target.files[0]);
    }
  };

  const triggerFileInput = (accept: string) => {
    setFileAccept(accept);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 0);
  };

  const handleSubmit = async (textToSubmit: string = prompt, recommendedModel?: string) => {
    if (isGeneratingState) return;
    
    const file = attachedFile;
    const fileName = file ? file.name : null;
    
    if (!textToSubmit.trim()) return;

    if (chatAbortControllerRef.current) {
      chatAbortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    chatAbortControllerRef.current = abortController;

    setIsGeneratingState(true);
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSubmit + (fileName ? `\n\n[Attached File: ${fileName}]` : ''),
    };
    const aiMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, {
      ...userMsg,
    }, {
      id: aiMsgId,
      role: 'ai',
      content: '',
      isLoading: true
    }]);
    setPrompt('');
    setAttachedFile(null);

    try {
      const { message, chatId } = await chatService.sendMessage(textToSubmit, {
        chatId: currentChatId,
        currentModel: recommendedModel || currentModel,
        webSearchEnabled,
        responseQuality,
        attachedFile: file,
        signal: abortController.signal
      });
      
      if (abortController.signal.aborted) return;

      // If it was a new chat, the backend generated an ID. We update our global state.
      if (currentChatId === null && activeChatIdRef.current === null) {
        setCurrentChatId(chatId);
        // Refresh global history so the sidebar updates instantly
        try {
          const updatedHistory = await chatService.getChatHistory();
          setHistory(updatedHistory);
        } catch (historyErr) {
          console.error("Failed to update history after message:", historyErr);
        }
      } else if (currentChatId === null) {
        // The user navigated away before the new chat was fully generated.
        // We fetch the history so the new chat shows up in the sidebar, but we don't switch to it.
        try {
          const updatedHistory = await chatService.getChatHistory();
          setHistory(updatedHistory);
        } catch (historyErr) {
          console.error("Failed to update history after message:", historyErr);
        }
      }

      setMessages((prev) => prev.map(msg => {
        if (msg.id === aiMsgId) {
          return {
            ...msg,
            id: message.id, // Overwrite temporary ID with the real backend UUID
            isLoading: false,
            content: message.content,
            sources: message.sources,
          };
        }
        return msg;
      }));
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      
      setMessages((prev) => prev.map(msg => msg.id === aiMsgId ? {
        ...msg,
        isLoading: false,
        content: 'Unable to get a response right now. Please try again.',
      } : msg));
    } finally {
      if (!abortController.signal.aborted) {
        setIsGeneratingState(false);
      }
    }
  };

  const handleRegenerate = async (messageId: string, type: 'standard' | 'improve') => {
    if (isGeneratingState) return;
    
    if (chatAbortControllerRef.current) {
      chatAbortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    chatAbortControllerRef.current = abortController;
    
    setIsGeneratingState(true);
    
    // Set message to loading state
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isLoading: true, content: '' } : msg
    ));

    try {
      const regeneratedMsg = await chatService.regenerateMessage(messageId, type, {
        chatId: currentChatId,
        currentModel,
        webSearchEnabled,
        responseQuality,
        signal: abortController.signal
      });
      
      if (abortController.signal.aborted) return;

      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? {
          ...msg,
          isLoading: false,
          content: regeneratedMsg.content,
          sources: regeneratedMsg.sources,
        } : msg
      ));
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? {
          ...msg,
          isLoading: false,
          content: 'Unable to regenerate right now. Please try again.',
        } : msg
      ));
    } finally {
      if (!abortController.signal.aborted) {
        setIsGeneratingState(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return {
    prompt,
    setPrompt,
    messages,
    attachedFile,
    setAttachedFile,
    responseQuality,
    setResponseQuality,
    fileAccept,
    isPreviewOpen,
    setIsPreviewOpen,
    scrollRef,
    fileInputRef,
    handleFileChange,
    triggerFileInput,
    handleSubmit,
    handleRegenerate,
    handleKeyDown,
    currentModel,
    setCurrentModel,
    webSearchEnabled,
    setWebSearchEnabled,
    isGenerating: isGeneratingState,
  };
}



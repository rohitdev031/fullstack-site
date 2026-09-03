import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { chatService } from '@/services/chatService';
import { type Message, type ResponseQuality } from '../types';

export function useAskChat() {
  const {
    currentChatId, setCurrentChatId,
    currentModel, setCurrentModel,
    webSearchEnabled, setWebSearchEnabled,
    setHistory
  } = useAppContext();

  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [responseQuality, setResponseQuality] = useState<ResponseQuality>('Balanced');
  const [fileAccept, setFileAccept] = useState<string>('*/*');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const activeChatIdRef = useRef(currentChatId);

  useEffect(() => {
    activeChatIdRef.current = currentChatId;
    if (currentChatId === null) {
      setMessages([]);
    }
  }, [currentChatId]);

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

  const handleSubmit = async (textToSubmit: string = prompt) => {
    if (isGenerating) return;

    const file = attachedFile;
    const fileName = file ? file.name : null;

    if (!textToSubmit.trim() && !file) return;

    setIsGenerating(true);
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
        currentModel,
        webSearchEnabled,
        responseQuality,
        attachedFile: file,
      });

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
            isLoading: false,
            content: message.content,
            sources: message.sources,
          };
        }
        return msg;
      }));
    } catch {
      setMessages((prev) => prev.map(msg => msg.id === aiMsgId ? {
        ...msg,
        isLoading: false,
        content: 'Unable to get a response right now. Please try again.',
      } : msg));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async (messageId: string, type: 'standard' | 'improve') => {
    if (isGenerating) return;
    setIsGenerating(true);

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
      });

      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? {
          ...msg,
          isLoading: false,
          content: regeneratedMsg.content,
          sources: regeneratedMsg.sources,
        } : msg
      ));
    } catch {
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? {
          ...msg,
          isLoading: false,
          content: 'Unable to regenerate right now. Please try again.',
        } : msg
      ));
    } finally {
      setIsGenerating(false);
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
    isGenerating,
  };
}

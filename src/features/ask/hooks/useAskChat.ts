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
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [responseQuality, setResponseQuality] = useState<ResponseQuality>('Balanced');
  const [fileAccept, setFileAccept] = useState<string>('*/*');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch history when currentChatId changes
  useEffect(() => {
    if (currentChatId === null) return;

    const loadOldChat = async () => {
      try {
        const oldMessages = await chatService.getChatMessages(currentChatId);
        // Cast the backend messages to our local Message type
        setMessages(oldMessages as Message[]);
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    };

    loadOldChat();
  }, [currentChatId]);

  const visibleMessages = currentChatId === null ? [] : messages;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachedFile(e.target.files[0].name);
    }
  };

  const triggerFileInput = (accept: string) => {
    setFileAccept(accept);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 0);
  };

  const handleSubmit = async (textToSubmit: string = prompt) => {
    const fileName = attachedFile;
    if (!textToSubmit.trim() && !fileName) return;

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
        attachedFile: fileName,
      });

      // If it was a new chat, the backend generated an ID. We update our global state.
      if (currentChatId === null) {
        setCurrentChatId(chatId);
        // Refresh global history so the sidebar updates instantly
        const updatedHistory = await chatService.getChatHistory();
        setHistory(updatedHistory);
      }

      setMessages((prev) => prev.map(msg => {
        if (msg.id === aiMsgId) {
          return {
            ...msg,
            isLoading: false,
            content: message.content,
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
    }
  };

  const handleRegenerate = async (messageId: string, type: 'standard' | 'improve') => {
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
    messages: visibleMessages,
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
    setWebSearchEnabled
  };
}

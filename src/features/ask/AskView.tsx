import { useNavigate } from 'react-router-dom';
import { chatService } from '@/services/chat/chatService';
import { useAskChat } from './hooks/useAskChat';
import { useChatSuggestions } from './hooks/useChatSuggestions';
import { AskControls } from './components/AskControls';
import { AskEmptyState } from './components/AskEmptyState';
import { ChatMessageList } from './components/ChatMessageList';
import { ChatComposer } from './components/ChatComposer';
import { AskSidebar } from './components/AskSidebar';
import { FilePreviewModal } from './components/FilePreviewModal';

export function AskView() {
  const navigate = useNavigate();
  const { suggestions, error: suggestionsError } = useChatSuggestions();

  const {
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
    setWebSearchEnabled
  } = useAskChat();

  return (
    <div className="max-w-[1600px] w-full mx-auto flex-1 flex flex-col xl:flex-row gap-8 pb-4 md:pb-10 h-full min-h-0">

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-h-0 relative pr-2">

        {/* Desktop Header */}
        <div className="hidden md:block shrink-0 mb-4">
          <h1 className="text-2xl font-bold mb-1 tracking-tight">Ask</h1>
          <p className="text-muted-foreground text-[14px]">Ask anything. Get detailed answers from the best AI models.</p>
        </div>

        <AskControls
          currentModel={currentModel}
          setCurrentModel={setCurrentModel}
          webSearchEnabled={webSearchEnabled}
          setWebSearchEnabled={setWebSearchEnabled}
          responseQuality={responseQuality}
          setResponseQuality={setResponseQuality}
        />

        {/* Scrollable Chat Area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto scrollbar-hide flex flex-col pb-44"
        >
          {messages.length === 0 ? (
            <AskEmptyState
              suggestions={suggestions}
              error={suggestionsError}
              onSuggestionClick={async (text) => {
                const recommendedModel = await chatService.recommendModel(text);
                if (recommendedModel) {
                  setCurrentModel(recommendedModel);
                }
                handleSubmit(text, recommendedModel || undefined);
              }}
            />
          ) : (
            <ChatMessageList
              messages={messages}
              currentModel={currentModel}
              onRegenerate={handleRegenerate}
            />
          )}
        </div>

        <ChatComposer
          prompt={prompt}
          setPrompt={setPrompt}
          attachedFile={attachedFile}
          setAttachedFile={setAttachedFile}
          fileInputRef={fileInputRef}
          handleFileChange={handleFileChange}
          fileAccept={fileAccept}
          triggerFileInput={triggerFileInput}
          setIsPreviewOpen={setIsPreviewOpen}
          handleKeyDown={handleKeyDown}
          handleSubmit={handleSubmit}
          currentModel={currentModel}
          webSearchEnabled={webSearchEnabled}
          setWebSearchEnabled={setWebSearchEnabled}
        />

      </div>

      <AskSidebar 
        currentModel={currentModel} 
        onAnalyzeDocument={() => triggerFileInput('*/*')}
        onWriteContent={() => setPrompt("Help me write a ")}
        onCompareModels={() => navigate('/compare')}
        onVerifyAnswer={() => setPrompt("Verify if this is correct: ")}
        onToggleWebSearch={() => setWebSearchEnabled(!webSearchEnabled)}
      />

      {isPreviewOpen && attachedFile && (
        <FilePreviewModal
          attachedFile={attachedFile}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}

    </div>
  );
}

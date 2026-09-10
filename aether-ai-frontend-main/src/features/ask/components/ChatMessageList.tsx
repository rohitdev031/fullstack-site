import { type Message } from '../types';
import { ChatMessageCard } from './ChatMessageCard';

type ChatMessageListProps = {
  messages: Message[];
  currentModel: string;
  onRegenerate: (messageId: string, type: 'standard' | 'improve') => void;
};

export function ChatMessageList({ messages, currentModel, onRegenerate }: ChatMessageListProps) {
  return (
    <div className="flex flex-col gap-8 shrink-0">
      {messages.map((msg) => (
        <div key={msg.id} className={`flex flex-col gap-3 ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
          <ChatMessageCard message={msg} currentModel={currentModel} onRegenerate={onRegenerate} />
        </div>
      ))}
    </div>
  );
}

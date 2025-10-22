import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageBubble from './MessageBubble';
import LoadingIndicator from './LoadingIndicator';
import type { Message } from '@shared/schema';

interface MessageAreaProps {
  messages: Message[];
  isLoading: boolean;
}

export default function MessageArea({ messages, isLoading }: MessageAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isLoading]);

  return (
    <ScrollArea className="flex-1 bg-background">
      <div className="mx-auto max-w-3xl px-4 py-6">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && <LoadingIndicator />}
            <div ref={scrollRef} />
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full items-center justify-center" data-testid="empty-state">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-primary/10 p-6">
            <svg
              className="h-12 w-12 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
        </div>
        <h3 className="mb-2 text-lg font-semibold">ابدأ محادثة جديدة</h3>
        <p className="text-sm text-muted-foreground">
          اطرح سؤالاً أو ابدأ محادثة مع الذكاء الاصطناعي
        </p>
      </div>
    </div>
  );
}

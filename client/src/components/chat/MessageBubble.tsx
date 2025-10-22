import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Copy, Check, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from '@shared/schema';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const { theme, direction } = useTheme();
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  let linkCounter = 0;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in-up",
        isUser ? (direction === 'rtl' ? 'justify-start' : 'justify-end') : (direction === 'rtl' ? 'justify-end' : 'justify-start')
      )}
      data-testid={`message-${message.id}`}
    >
      {/* Avatar - shown first for AI, last for user */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-chart-2/10" data-testid={`avatar-ai-${message.id}`}>
          <Sparkles className="h-4 w-4 text-chart-2" />
        </div>
      )}

      {/* Message Content */}
      <div
        className={cn(
          "group relative rounded-lg px-4 py-3 transition-all",
          isUser
            ? "max-w-[75%] bg-primary text-primary-foreground"
            : "max-w-full bg-muted text-foreground"
        )}
      >
        {/* Copy Button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute -top-2 opacity-0 group-hover:opacity-100 transition-opacity",
            direction === 'rtl' ? '-start-2' : '-end-2'
          )}
          onClick={handleCopy}
          data-testid={`button-copy-message-${message.id}`}
        >
          {copied ? (
            <Check className="h-3 w-3" data-testid={`icon-copied-${message.id}`} />
          ) : (
            <Copy className="h-3 w-3" data-testid={`icon-copy-${message.id}`} />
          )}
        </Button>

        {/* Message Text with Markdown Support */}
        <div className="prose prose-sm max-w-none dark:prose-invert" data-testid={`message-content-${message.id}`}>
          {isUser ? (
            <p className="m-0 text-[15px] leading-relaxed whitespace-pre-wrap" data-testid={`text-user-message-${message.id}`}>
              {message.content}
            </p>
          ) : (
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');
                  
                  return !inline && match ? (
                    <div className="relative my-4">
                      <div className="mb-2 flex items-center justify-between rounded-t-md bg-muted-foreground/10 px-3 py-1">
                        <span className="text-xs text-muted-foreground">{match[1]}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(codeString)}
                          data-testid={`button-copy-code-${message.id}`}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <SyntaxHighlighter
                        style={theme === 'dark' ? vscDarkPlus : vs}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-b-md !mt-0"
                        {...props}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className="rounded bg-muted-foreground/10 px-1.5 py-0.5 text-sm" {...props}>
                      {children}
                    </code>
                  );
                },
                p({ children }) {
                  return <p className="mb-2 last:mb-0 text-[15px] leading-relaxed">{children}</p>;
                },
                ul({ children }) {
                  return <ul className="my-2 list-disc ps-6 space-y-1">{children}</ul>;
                },
                ol({ children }) {
                  return <ol className="my-2 list-decimal ps-6 space-y-1">{children}</ol>;
                },
                li({ children }) {
                  return <li className="text-[15px]">{children}</li>;
                },
                a({ children, href }) {
                  const currentIndex = linkCounter++;
                  return (
                    <a 
                      href={href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                      data-testid={`link-message-${message.id}-${currentIndex}`}
                    >
                      {children}
                    </a>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Timestamp */}
        <div 
          className={cn(
            "mt-1 text-xs opacity-70",
            isUser ? "text-primary-foreground" : "text-muted-foreground"
          )}
          data-testid={`text-timestamp-${message.id}`}
        >
          {new Date(message.createdAt).toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10" data-testid={`avatar-user-${message.id}`}>
          <User className="h-4 w-4 text-primary" />
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Paperclip, 
  Send, 
  Lightbulb, 
  FileCode, 
  FileText, 
  Wand2,
  X 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { AIModel } from '@shared/schema';

interface ComposerProps {
  sessionId?: string;
  selectedModel: AIModel;
  disabled?: boolean;
  onSendMessage: (content: string, attachments?: File[]) => void;
}

const quickActions = [
  { id: 'summarize', label: 'تلخيص', icon: FileText },
  { id: 'brainstorm', label: 'عصف ذهني', icon: Lightbulb },
  { id: 'code', label: 'كود', icon: FileCode },
  { id: 'improve', label: 'تحسين', icon: Wand2 },
];

export default function Composer({ 
  sessionId, 
  selectedModel, 
  disabled,
  onSendMessage 
}: ComposerProps) {
  const { direction } = useTheme();
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [content]);

  const handleSend = () => {
    if (!content.trim() && attachments.length === 0) return;
    
    onSendMessage(content, attachments);
    setContent('');
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuickAction = (action: string) => {
    const prompts: Record<string, string> = {
      summarize: 'لخص النص التالي: ',
      brainstorm: 'أعطني أفكار حول: ',
      code: 'اكتب كود لـ: ',
      improve: 'حسن النص التالي: ',
    };
    setContent(prompts[action] || '');
    textareaRef.current?.focus();
  };

  return (
    <div className="border-t bg-background p-4">
      <div className="mx-auto max-w-3xl">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="gap-2 pe-1"
                data-testid={`attachment-${index}`}
              >
                <Paperclip className="h-3 w-3" />
                <span className="max-w-[150px] truncate">{file.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 hover:bg-transparent"
                  onClick={() => removeAttachment(index)}
                  data-testid={`button-remove-attachment-${index}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              className="shrink-0 gap-2"
              onClick={() => handleQuickAction(action.id)}
              data-testid={`button-quick-${action.id}`}
            >
              <action.icon className="h-4 w-4" />
              <span>{action.label}</span>
            </Button>
          ))}
        </div>

        {/* Input Area */}
        <div className="relative flex items-end gap-2 rounded-xl border bg-background p-3 shadow-sm">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            data-testid="input-file"
          />

          {/* Attachment Button */}
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            data-testid="button-attach"
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          {/* Text Input */}
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              direction === 'rtl' 
                ? 'اكتب رسالتك هنا... (Shift + Enter للسطر الجديد)'
                : 'Type your message... (Shift + Enter for new line)'
            }
            className="min-h-[44px] max-h-[200px] resize-none border-0 p-0 text-[15px] shadow-none focus-visible:ring-0"
            disabled={disabled}
            data-testid="textarea-message"
          />

          {/* Send Button */}
          <Button
            size="icon"
            onClick={handleSend}
            disabled={disabled || (!content.trim() && attachments.length === 0)}
            className={cn(
              "shrink-0 rounded-lg transition-all",
              content.trim() || attachments.length > 0
                ? "bg-primary hover:bg-primary/90"
                : "bg-muted"
            )}
            data-testid="button-send"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>

        {/* Character Count (for long messages) */}
        {content.length > 500 && (
          <div className="mt-2 text-xs text-muted-foreground text-end">
            {content.length} / 4000
          </div>
        )}
      </div>
    </div>
  );
}

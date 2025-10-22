import { Sparkles } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export default function LoadingIndicator() {
  const { direction } = useTheme();

  return (
    <div
      className={cn(
        "flex gap-3",
        direction === 'rtl' ? 'justify-end' : 'justify-start'
      )}
      data-testid="loading-indicator"
    >
      {/* AI Avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-chart-2/10">
        <Sparkles className="h-4 w-4 text-chart-2" />
      </div>

      {/* Typing Animation */}
      <div className="flex items-center gap-3 rounded-lg bg-muted px-4 py-3">
        <div className="flex gap-1">
          <div className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-pulse-dot" style={{ animationDelay: '0ms' }} />
          <div className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-pulse-dot" style={{ animationDelay: '150ms' }} />
          <div className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-pulse-dot" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-sm text-muted-foreground">جاري الكتابة...</span>
      </div>
    </div>
  );
}

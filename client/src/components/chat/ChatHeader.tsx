import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, Sun, Moon, Languages, MoreVertical, Sparkles, MessageSquare } from 'lucide-react';
import { availableModels, type ChatSession, type AIModel } from '@shared/schema';
import { Badge } from '@/components/ui/badge';

interface ChatHeaderProps {
  session: ChatSession | null;
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
  onMenuToggle: () => void;
}

export default function ChatHeader({ 
  session, 
  selectedModel, 
  onModelChange,
  onMenuToggle 
}: ChatHeaderProps) {
  const { theme, toggleTheme, direction, toggleDirection } = useTheme();

  return (
    <div className="flex h-16 items-center justify-between border-b bg-background px-4">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="md:hidden"
          data-testid="button-menu-toggle"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold" data-testid="text-session-title">
            {session?.title || 'محادثة جديدة'}
          </h1>
          {session?.mode === 'agent' && (
            <Badge variant="secondary" className="gap-1" data-testid="badge-agent-mode">
              <Sparkles className="h-3 w-3" />
              Agent
            </Badge>
          )}
        </div>
      </div>

      {/* Center Section - Model Selector */}
      <div className="hidden md:flex items-center gap-2">
        <Select
          value={selectedModel.id}
          onValueChange={(value) => {
            const model = availableModels.find(m => m.id === value);
            if (model) onModelChange(model);
          }}
        >
          <SelectTrigger className="w-[180px]" data-testid="select-model-trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableModels.map((model) => (
              <SelectItem 
                key={model.id} 
                value={model.id}
                data-testid={`select-model-${model.id}`}
              >
                <div className="flex items-center gap-2">
                  <span>{model.name}</span>
                  {model.provider === 'openai' && (
                    <Badge variant="outline" className="text-xs">OpenAI</Badge>
                  )}
                  {model.provider === 'deepseek' && (
                    <Badge variant="outline" className="text-xs">DeepSeek</Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Mode Toggle */}
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          data-testid="button-toggle-mode"
        >
          {session?.mode === 'agent' ? (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Agent</span>
            </>
          ) : (
            <>
              <MessageSquare className="h-4 w-4" />
              <span>Chat</span>
            </>
          )}
        </Button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Connection Status */}
        <div className="hidden md:flex items-center gap-2" data-testid="status-connection">
          <div className="h-2 w-2 rounded-full bg-status-online animate-pulse-dot" />
          <span className="text-xs text-muted-foreground">متصل</span>
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          data-testid="button-toggle-theme"
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>

        {/* Language/Direction Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDirection}
          data-testid="button-toggle-direction"
        >
          <Languages className="h-5 w-5" />
        </Button>

        {/* More Options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="button-more-options">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem data-testid="button-clear-history">
              مسح السجل
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="button-export-chat">
              تصدير المحادثة
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem data-testid="button-settings">
              الإعدادات
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

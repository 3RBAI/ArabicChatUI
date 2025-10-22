import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquarePlus, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Star,
  Clock,
  MoreVertical,
  Trash2,
  Pin
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { ChatSession } from '@shared/schema';

interface ChatSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  currentSessionId?: string;
  onSessionSelect: (session: ChatSession) => void;
  onNewSession: () => void;
}

export default function ChatSidebar({ 
  collapsed, 
  onToggle, 
  currentSessionId,
  onSessionSelect,
  onNewSession 
}: ChatSidebarProps) {
  const { direction } = useTheme();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch sessions
  const { data: sessions = [] } = useQuery<ChatSession[]>({
    queryKey: ['/api/sessions'],
  });

  // Pin/unpin session mutation
  const togglePinMutation = useMutation({
    mutationFn: async ({ id, isPinned }: { id: string; isPinned: boolean }) => {
      return await apiRequest('PATCH', `/api/sessions/${id}`, { isPinned: !isPinned });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
    },
  });

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/sessions/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      toast({
        title: 'تم الحذف',
        description: 'تم حذف الجلسة بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل حذف الجلسة',
        variant: 'destructive',
      });
    },
  });

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pinnedSessions = filteredSessions.filter(s => s.isPinned);
  const recentSessions = filteredSessions.filter(s => !s.isPinned);

  const CollapseIcon = direction === 'rtl' ? ChevronRight : ChevronLeft;

  return (
    <div
      className={cn(
        "border-e bg-sidebar transition-all duration-250",
        collapsed ? "w-16" : "w-[280px]"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!collapsed && (
            <h2 className="text-lg font-semibold" data-testid="text-sidebar-title">
              AI Chat
            </h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="shrink-0"
            data-testid="button-toggle-sidebar"
          >
            <CollapseIcon className="h-5 w-5" />
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <Button
            variant="default"
            className={cn("w-full", collapsed && "px-2")}
            onClick={onNewSession}
            data-testid="button-new-chat"
          >
            <MessageSquarePlus className={cn("h-5 w-5", !collapsed && "me-2")} />
            {!collapsed && <span>محادثة جديدة</span>}
          </Button>
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="px-3 pb-3">
            <div className="relative">
              <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground start-3" />
              <Input
                placeholder="ابحث في المحادثات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ps-9"
                data-testid="input-search-sessions"
              />
            </div>
          </div>
        )}

        {/* Sessions List */}
        <ScrollArea className="flex-1">
          {!collapsed ? (
            <div className="space-y-1 p-2">
              {/* Pinned Sessions */}
              {pinnedSessions.length > 0 && (
                <div className="mb-4">
                  <div className="mb-2 flex items-center gap-2 px-3 text-xs font-medium text-muted-foreground">
                    <Star className="h-3 w-3" />
                    <span>مثبت</span>
                  </div>
                  {pinnedSessions.map((session) => (
                    <SessionItem
                      key={session.id}
                      session={session}
                      isActive={currentSessionId === session.id}
                      onClick={() => onSessionSelect(session)}
                      onTogglePin={() => togglePinMutation.mutate({ id: session.id, isPinned: session.isPinned || false })}
                      onDelete={() => deleteSessionMutation.mutate(session.id)}
                    />
                  ))}
                </div>
              )}

              {/* Recent Sessions */}
              <div>
                <div className="mb-2 flex items-center gap-2 px-3 text-xs font-medium text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>الأحدث</span>
                </div>
                {recentSessions.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={currentSessionId === session.id}
                    onClick={() => onSessionSelect(session)}
                    onTogglePin={() => togglePinMutation.mutate({ id: session.id, isPinned: session.isPinned || false })}
                    onDelete={() => deleteSessionMutation.mutate(session.id)}
                  />
                ))}
              </div>
            </div>
          ) : (
            // Collapsed state - show icons only
            <div className="space-y-2 p-2">
              {sessions.slice(0, 5).map((session) => (
                <Button
                  key={session.id}
                  variant={currentSessionId === session.id ? "secondary" : "ghost"}
                  size="icon"
                  className="w-full"
                  onClick={() => onSessionSelect(session)}
                  data-testid={`button-session-${session.id}`}
                >
                  <MessageSquarePlus className="h-5 w-5" />
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

interface SessionItemProps {
  session: ChatSession;
  isActive: boolean;
  onClick: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
}

function SessionItem({ session, isActive, onClick, onTogglePin, onDelete }: SessionItemProps) {
  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 rounded-md px-3 py-2 transition-colors cursor-pointer hover-elevate",
        isActive ? "bg-sidebar-accent" : ""
      )}
      onClick={onClick}
      data-testid={`session-${session.id}`}
    >
      <div className="flex-1 overflow-hidden">
        <div className="truncate text-sm font-medium" data-testid={`text-session-title-${session.id}`}>
          {session.title}
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {session.model} • {session.mode}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100"
            data-testid={`button-session-menu-${session.id}`}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin();
            }}
            data-testid={`button-pin-session-${session.id}`}
          >
            <Pin className="h-4 w-4 me-2" />
            {session.isPinned ? 'إلغاء التثبيت' : 'تثبيت'}
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            data-testid={`button-delete-session-${session.id}`}
          >
            <Trash2 className="h-4 w-4 me-2" />
            حذف
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

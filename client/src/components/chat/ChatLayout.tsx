import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import ChatSidebar from './ChatSidebar';
import ChatHeader from './ChatHeader';
import MessageArea from './MessageArea';
import Composer from './Composer';
import type { Message, ChatSession, AIModel } from '@shared/schema';

export default function ChatLayout() {
  const { direction } = useTheme();
  const { toast } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel>({
    id: 'gpt-5',
    name: 'GPT-5',
    provider: 'openai'
  });

  // Fetch messages for current session
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ['/api/sessions', currentSession?.id, 'messages'],
    enabled: !!currentSession?.id,
  });

  // Create new session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (data: { title: string; model: string; mode: string }) => {
      return await apiRequest('POST', '/api/sessions', data);
    },
    onSuccess: (newSession: ChatSession) => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      setCurrentSession(newSession);
      toast({
        title: 'تم إنشاء جلسة جديدة',
        description: newSession.title,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل إنشاء الجلسة',
        variant: 'destructive',
      });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, sessionId, model, files }: { 
      content: string; 
      sessionId: string; 
      model: string;
      files?: File[];
    }) => {
      // If there are files, upload them first
      let attachmentIds: string[] = [];
      if (files && files.length > 0) {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload files');
        }
        
        const attachments = await uploadResponse.json();
        attachmentIds = attachments.map((a: any) => a.id);
      }

      return await apiRequest('POST', `/api/sessions/${sessionId}/messages`, { 
        content, 
        model,
        attachmentIds 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/sessions', currentSession?.id, 'messages'] 
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في الإرسال',
        description: error.message || 'فشل إرسال الرسالة',
        variant: 'destructive',
      });
    },
  });

  // Create initial session on mount if none exists
  useEffect(() => {
    if (!currentSession) {
      createSessionMutation.mutate({
        title: 'محادثة جديدة',
        model: selectedModel.id,
        mode: 'chat',
      });
    }
  }, []);

  const handleSendMessage = async (content: string, files?: File[]) => {
    if (!currentSession) {
      toast({
        title: 'خطأ',
        description: 'لا توجد جلسة نشطة',
        variant: 'destructive',
      });
      return;
    }

    sendMessageMutation.mutate({
      content,
      sessionId: currentSession.id,
      model: selectedModel.id,
      files,
    });
  };

  const handleNewSession = () => {
    createSessionMutation.mutate({
      title: 'محادثة جديدة',
      model: selectedModel.id,
      mode: 'chat',
    });
  };

  return (
    <div className="flex h-screen w-full bg-background" dir={direction}>
      {/* Sidebar */}
      <ChatSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentSessionId={currentSession?.id}
        onSessionSelect={setCurrentSession}
        onNewSession={handleNewSession}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <ChatHeader
          session={currentSession}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Messages */}
        <MessageArea 
          messages={messages} 
          isLoading={sendMessageMutation.isPending || messagesLoading} 
        />

        {/* Composer */}
        <Composer
          sessionId={currentSession?.id}
          selectedModel={selectedModel}
          disabled={sendMessageMutation.isPending}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}

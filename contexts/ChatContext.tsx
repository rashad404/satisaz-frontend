"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { chatApi, visitorsApi } from '@/lib/api/chat';
import authService from '@/lib/api/auth';
import { useWebSocket } from '@/hooks/useWebSocket';
import type {
  Tenant,
  Conversation,
  ChatMessage,
  Agent,
  AgentStatusType,
  AgentStatusMode,
  NewConversationEvent,
  ConversationAcceptedEvent,
  ConversationClosedEvent,
  ConversationTransferredEvent,
  NewMessageEvent,
  NewVisitorEvent,
  VisitorOnlineEvent,
  TypingIndicatorEvent,
  AgentStatusChangedEvent,
  AiTookOverEvent,
  HumanTookOverEvent,
  NotificationSettings,
} from '@/lib/types/chat';

interface ChatContextValue {
  // Tenant state
  tenant: Tenant | null;
  isLoadingTenant: boolean;

  // Conversations state
  conversations: Conversation[];
  queuedConversations: Conversation[];
  activeConversation: Conversation | null;
  isLoadingConversations: boolean;

  // Messages state
  messages: ChatMessage[];
  isLoadingMessages: boolean;

  // Agent state
  agents: Agent[];
  currentUserId: number | null;
  myStatus: AgentStatusType;
  statusMode: AgentStatusMode;
  onlineAgentsCount: number;

  // Typing state
  typingUsers: Map<number, { name: string; timestamp: number }>;

  // Visitors state
  onlineVisitorsCount: number;

  // WebSocket state
  isConnected: boolean;

  // Sound state
  isMuted: boolean;

  // Notification settings
  notificationSettings: NotificationSettings;

  // Actions
  loadTenant: (tenantId?: number) => Promise<void>;
  loadAgents: () => Promise<void>;
  loadConversations: () => Promise<void>;
  loadQueue: () => Promise<void>;
  selectConversation: (conversationId: number | null) => Promise<void>;
  sendMessage: (content: string, files?: File[]) => Promise<void>;
  acceptConversation: (conversationId: number) => Promise<void>;
  takeoverConversation: (conversationId: number) => Promise<void>;
  closeConversation: (conversationId: number) => Promise<void>;
  transferConversation: (conversationId: number, toAgentId: number, reason?: string) => Promise<void>;
  declineConversation: (conversationId: number) => Promise<void>;
  updateMyStatus: (status: AgentStatusType) => Promise<void>;
  updateStatusMode: (mode: AgentStatusMode) => Promise<void>;
  sendTypingIndicator: (isTyping: boolean) => void;
  markMessagesAsRead: () => Promise<void>;
  toggleMute: () => void;
  loadNotificationSettings: () => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

interface ChatProviderProps {
  children: React.ReactNode;
  tenantId: number;
}

export function ChatProvider({ children, tenantId }: ChatProviderProps) {
  // Tenant state
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoadingTenant, setIsLoadingTenant] = useState(true);

  // Conversations state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [queuedConversations, setQueuedConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);

  // Messages state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Agent state
  const [agents, setAgents] = useState<Agent[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [myStatus, setMyStatus] = useState<AgentStatusType>('offline');
  const [onlineAgentsCount, setOnlineAgentsCount] = useState(0);

  // Status mode: persisted to localStorage
  const [statusMode, setStatusMode] = useState<AgentStatusMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(`satis_status_mode_${tenantId}`) as AgentStatusMode) || 'auto';
    }
    return 'auto';
  });

  // Typing state
  const [typingUsers, setTypingUsers] = useState<Map<number, { name: string; timestamp: number }>>(new Map());

  // Online visitors count
  const [onlineVisitorsCount, setOnlineVisitorsCount] = useState(0);

  // Sound mute state (persisted in localStorage)
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('satis_agent_muted') === 'true';
    }
    return false;
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    sound: { new_conversation: true, new_message: true, new_visitor: false },
    email: { new_conversation: true, transfer_request: true, workspace_invite: true },
    sms: { new_conversation: false, transfer_request: false },
  });

  // Refs for callbacks
  const activeConversationRef = useRef<Conversation | null>(null);
  activeConversationRef.current = activeConversation;

  const currentUserIdRef = useRef<number | null>(null);
  currentUserIdRef.current = currentUserId;

  const isMutedRef = useRef<boolean>(isMuted);
  isMutedRef.current = isMuted;

  const notificationSettingsRef = useRef<NotificationSettings>(notificationSettings);
  notificationSettingsRef.current = notificationSettings;

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newValue = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('satis_agent_muted', String(newValue));
      }
      return newValue;
    });
  }, []);

  // WebSocket event handlers
  const handleNewConversation = useCallback((event: NewConversationEvent) => {
    // Only add to queue if it's actually a queued, unassigned conversation
    // Agent-initiated chats are created as ACTIVE and already assigned
    if (event.conversation.status === 'queued' && event.conversation.handler_type === 'unassigned') {
      setQueuedConversations((prev) => [event.conversation, ...prev]);
      // Play notification sound (respects both mute toggle and notification settings)
      playNotificationSound(isMutedRef.current, notificationSettingsRef.current.sound.new_conversation);
    } else {
      // For agent-initiated or already-assigned conversations, add to conversations list
      setConversations((prev) => {
        if (prev.some((c) => c.id === event.conversation.id)) {
          return prev;
        }
        return [event.conversation, ...prev];
      });
    }
  }, []);

  const handleConversationAccepted = useCallback((event: ConversationAcceptedEvent) => {
    // Remove from queue
    setQueuedConversations((prev) => prev.filter((c) => c.id !== event.conversation_id));

    // Update in conversations list
    setConversations((prev) => prev.map((c) => {
      if (c.id === event.conversation_id) {
        return { ...c, status: event.status, handler_type: event.handler_type, assigned_agent: event.agent };
      }
      return c;
    }));

    // Update active conversation if it's the same
    if (activeConversationRef.current?.id === event.conversation_id) {
      setActiveConversation((prev) => prev ? { ...prev, status: event.status, handler_type: event.handler_type, assigned_agent: event.agent } : null);
    }
  }, []);

  const handleConversationClosed = useCallback((event: ConversationClosedEvent) => {
    // Remove from queue if present
    setQueuedConversations((prev) => prev.filter((c) => c.id !== event.conversation_id));

    // Update in conversations list
    setConversations((prev) => prev.map((c) => {
      if (c.id === event.conversation_id) {
        return { ...c, status: 'closed', closed_at: event.closed_at };
      }
      return c;
    }));

    // Update active conversation if it's the same
    if (activeConversationRef.current?.id === event.conversation_id) {
      setActiveConversation((prev) => prev ? { ...prev, status: 'closed', closed_at: event.closed_at } : null);
    }
  }, []);

  const handleNewMessage = useCallback((event: NewMessageEvent) => {
    const { message } = event;
    const isViewingConversation = activeConversationRef.current?.id === message.conversation_id;

    // Add to messages if viewing this conversation
    if (isViewingConversation) {
      setMessages((prev) => {
        // Check if message already exists
        if (prev.some((m) => m.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });
    }

    // Update conversation list with last message (only if newer)
    setConversations((prev) => prev.map((c) => {
      if (c.id === message.conversation_id) {
        // Only update if this message is newer than current last_message
        const currentLastMessageTime = c.last_message?.created_at ? new Date(c.last_message.created_at).getTime() : 0;
        const newMessageTime = new Date(message.created_at).getTime();

        if (newMessageTime < currentLastMessageTime) {
          return c; // Skip update - current message is newer
        }

        return {
          ...c,
          last_message: {
            content: message.content,
            sender_type: message.sender_type,
            created_at: message.created_at,
          },
          // Only increment unread if not viewing this conversation and it's a visitor message
          unread_count: isViewingConversation ? 0 : (c.unread_count || 0) + (message.sender_type === 'visitor' ? 1 : 0),
          updated_at: message.created_at,
        };
      }
      return c;
    }));

    // Play sound for visitor messages (respects both mute toggle and notification settings)
    if (message.sender_type === 'visitor') {
      console.log('[ChatContext] Playing message sound for visitor message, muted:', isMutedRef.current, 'setting:', notificationSettingsRef.current.sound.new_message);
      playMessageSound(isMutedRef.current, notificationSettingsRef.current.sound.new_message);
    }
  }, []);

  const handleTypingIndicator = useCallback((event: TypingIndicatorEvent) => {
    if (event.typer_type === 'visitor' && activeConversationRef.current?.id === event.conversation_id) {
      setTypingUsers((prev) => {
        const next = new Map(prev);
        if (event.is_typing) {
          next.set(event.conversation_id, { name: event.typer_name || 'Visitor', timestamp: Date.now() });
        } else {
          next.delete(event.conversation_id);
        }
        return next;
      });
    }
  }, []);

  const handleAgentStatusChanged = useCallback((event: AgentStatusChangedEvent) => {
    setOnlineAgentsCount(event.online_agents_count);
    setAgents((prev) => prev.map((a) => {
      if (a.id === event.agent.id) {
        return { ...a, status: event.status };
      }
      return a;
    }));
  }, []);

  const handleAiTookOver = useCallback((event: AiTookOverEvent) => {
    setConversations((prev) => prev.map((c) => {
      if (c.id === event.conversation_id) {
        return { ...c, handler_type: 'ai', ai_took_over_at: event.ai_took_over_at };
      }
      return c;
    }));

    if (activeConversationRef.current?.id === event.conversation_id) {
      setActiveConversation((prev) => prev ? { ...prev, handler_type: 'ai', ai_took_over_at: event.ai_took_over_at } : null);
    }
  }, []);

  const handleHumanTookOver = useCallback((event: HumanTookOverEvent) => {
    setConversations((prev) => prev.map((c) => {
      if (c.id === event.conversation_id) {
        return { ...c, handler_type: 'human', assigned_agent: event.agent, human_took_over_at: event.human_took_over_at };
      }
      return c;
    }));

    if (activeConversationRef.current?.id === event.conversation_id) {
      setActiveConversation((prev) => prev ? { ...prev, handler_type: 'human', assigned_agent: event.agent, human_took_over_at: event.human_took_over_at } : null);
    }
  }, []);

  const handleConversationTransferred = useCallback((event: ConversationTransferredEvent) => {
    const targetAgentId = Number(event.transferred_to_agent_id);
    const myId = Number(currentUserIdRef.current);

    console.log('[ChatContext] Transfer event - targetAgentId:', targetAgentId, 'myId:', myId, 'match:', targetAgentId === myId);

    // Only show in queue if transferred to current user
    if (targetAgentId !== myId) {
      // Remove from queue if it was there (e.g., it was in general queue before)
      setQueuedConversations((prev) => prev.filter((c) => c.id !== event.conversation_id));
      return;
    }

    console.log('[ChatContext] Adding transferred conversation to queue:', event.conversation_id);

    // Add/update conversation in queue with transfer metadata
    setQueuedConversations((prev) => {
      const existing = prev.find((c) => c.id === event.conversation_id);
      const updatedConversation = {
        ...event.conversation,
        transferred_to_agent_id: event.transferred_to_agent_id,
        transferred_from_agent_name: event.transferred_from_agent.name,
        transferred_at: event.transferred_at,
        transfer_reason: event.reason,
      };

      if (existing) {
        return prev.map((c) => c.id === event.conversation_id ? updatedConversation : c);
      }
      return [updatedConversation, ...prev];
    });

    // Play notification sound (respects both mute toggle and notification settings)
    // Transfer uses new_conversation sound setting
    playNotificationSound(isMutedRef.current, notificationSettingsRef.current.sound.new_conversation);
  }, []);

  const handleNewVisitor = useCallback((event: NewVisitorEvent) => {
    // Update online count if new visitor is online
    if (event.visitor.is_online) {
      setOnlineVisitorsCount(c => c + 1);
    }
    // Play visitor sound (respects both mute toggle and notification settings)
    playVisitorSound(isMutedRef.current, notificationSettingsRef.current.sound.new_visitor);
  }, []);

  const handleVisitorOnline = useCallback((event: VisitorOnlineEvent) => {
    console.log('[ChatContext] handleVisitorOnline called:', event.visitor.id, event.visitor.name);
    // Update online count
    setOnlineVisitorsCount(c => c + 1);
    // Play visitor sound for returning visitors (uses same setting as new visitor)
    playVisitorSound(isMutedRef.current, notificationSettingsRef.current.sound.new_visitor);
  }, []);

  // WebSocket connection
  const { isConnected, subscribeToConversation } = useWebSocket({
    tenantId,
    conversationId: activeConversation?.id,
    onNewConversation: handleNewConversation,
    onConversationAccepted: handleConversationAccepted,
    onConversationClosed: handleConversationClosed,
    onConversationTransferred: handleConversationTransferred,
    onNewMessage: handleNewMessage,
    onNewVisitor: handleNewVisitor,
    onVisitorOnline: handleVisitorOnline,
    onTypingIndicator: handleTypingIndicator,
    onAgentStatusChanged: handleAgentStatusChanged,
    onAiTookOver: handleAiTookOver,
    onHumanTookOver: handleHumanTookOver,
  });

  // Load agents
  const loadAgents = useCallback(async () => {
    if (!tenantId) return;

    try {
      const agentsResponse = await chatApi.agents.list(tenantId);
      setAgents(agentsResponse.data);
      setOnlineAgentsCount(agentsResponse.data.filter((a) => a.status === 'online').length);

      // Find current user and set their status
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setCurrentUserId(currentUser.id);
        const me = agentsResponse.data.find(a => a.id === currentUser.id);
        if (me?.status) {
          setMyStatus(me.status);
        }
      }
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  }, [tenantId]);

  // Load notification settings
  const loadNotificationSettings = useCallback(async () => {
    if (!tenantId) return;

    try {
      const notifResponse = await chatApi.agents.getNotificationSettings(tenantId);
      setNotificationSettings(notifResponse.data);
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  }, [tenantId]);

  // Load tenant data
  const loadTenant = useCallback(async (id?: number) => {
    const targetId = id || tenantId;
    if (!targetId) return;

    setIsLoadingTenant(true);
    try {
      const response = await chatApi.tenants.get(targetId);
      setTenant(response.data);

      // Load agents
      const agentsResponse = await chatApi.agents.list(targetId);
      setAgents(agentsResponse.data);
      setOnlineAgentsCount(agentsResponse.data.filter((a) => a.status === 'online').length);

      // Load notification settings
      try {
        const notifResponse = await chatApi.agents.getNotificationSettings(targetId);
        setNotificationSettings(notifResponse.data);
      } catch (err) {
        console.error('Failed to load notification settings:', err);
      }

      // Find current user and apply status based on mode
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setCurrentUserId(currentUser.id);
        const me = agentsResponse.data.find(a => a.id === currentUser.id);
        const savedMode = (localStorage.getItem(`satis_status_mode_${targetId}`) as AgentStatusMode) || 'auto';

        if (savedMode === 'auto') {
          // Auto mode: go online when page opens
          try {
            await chatApi.agents.updateStatus(targetId, 'online');
            setMyStatus('online');
          } catch (err) {
            console.error('Failed to auto-set online:', err);
            setMyStatus(me?.status || 'offline');
          }
        } else {
          // Manual mode: respect what backend has
          setMyStatus(me?.status || 'offline');
        }
      }
    } catch (error) {
      console.error('Failed to load tenant:', error);
    } finally {
      setIsLoadingTenant(false);
    }
  }, [tenantId]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!tenantId) return;

    setIsLoadingConversations(true);
    try {
      const response = await chatApi.conversations.list(tenantId, { status: 'all', per_page: 50 });
      setConversations(response.data.data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [tenantId]);

  // Load queue
  const loadQueue = useCallback(async () => {
    if (!tenantId) return;

    try {
      const response = await chatApi.conversations.getQueue(tenantId);
      setQueuedConversations(response.data);
    } catch (error) {
      console.error('Failed to load queue:', error);
    }
  }, [tenantId]);

  // Track if a conversation selection is in progress to prevent race conditions
  const selectionInProgressRef = useRef<number | null>(null);

  // Select conversation
  const selectConversation = useCallback(async (conversationId: number | null) => {
    // Prevent duplicate/racing selections
    if (conversationId && selectionInProgressRef.current === conversationId) {
      console.log('[ChatContext] Selection already in progress for:', conversationId);
      return;
    }

    // If we're already viewing this conversation, skip
    if (conversationId && activeConversationRef.current?.id === conversationId) {
      console.log('[ChatContext] Already viewing conversation:', conversationId);
      return;
    }

    console.log('[ChatContext] selectConversation called:', conversationId);

    // Persist selected conversation
    if (conversationId) {
      localStorage.setItem(`satis_inbox_conversation_${tenantId}`, String(conversationId));
    } else {
      localStorage.removeItem(`satis_inbox_conversation_${tenantId}`);
    }

    if (!conversationId) {
      selectionInProgressRef.current = null;
      setActiveConversation(null);
      setMessages([]);
      return;
    }

    // Mark selection in progress
    selectionInProgressRef.current = conversationId;

    // Clear previous conversation state before loading new one
    setActiveConversation(null);
    setMessages([]);
    setIsLoadingMessages(true);

    try {
      const response = await chatApi.conversations.get(tenantId, conversationId);

      // Check if we're still trying to load this conversation (not superseded)
      if (selectionInProgressRef.current !== conversationId) {
        console.log('[ChatContext] Selection superseded, skipping:', conversationId, 'current:', selectionInProgressRef.current);
        return;
      }

      console.log('[ChatContext] Loaded conversation:', conversationId, 'messages:', response.data.messages?.length);
      setActiveConversation(response.data);
      setMessages(response.data.messages || []);

      // Subscribe to conversation channel
      subscribeToConversation(conversationId);

      // Reset unread count
      setConversations((prev) => prev.map((c) => {
        if (c.id === conversationId) {
          return { ...c, unread_count: 0 };
        }
        return c;
      }));
    } catch (error) {
      console.error('Failed to load conversation:', error);
      // Clear saved conversation if it failed to load
      localStorage.removeItem(`satis_inbox_conversation_${tenantId}`);
    } finally {
      // Only clear loading state if this was the last selection
      if (selectionInProgressRef.current === conversationId) {
        selectionInProgressRef.current = null;
        setIsLoadingMessages(false);
      }
    }
  }, [tenantId, subscribeToConversation]);

  // Send message
  const sendMessage = useCallback(async (content: string, files?: File[]) => {
    if (!activeConversation) return;

    try {
      const response = await chatApi.messages.send(tenantId, activeConversation.id, { content, files });
      // Message will be added via WebSocket event - add only if not already present
      setMessages((prev) => {
        if (prev.some((m) => m.id === response.data.id)) {
          return prev;
        }
        return [...prev, response.data];
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }, [tenantId, activeConversation]);

  // Accept conversation
  const acceptConversation = useCallback(async (conversationId: number) => {
    console.log('[ChatContext] Accepting conversation:', conversationId);
    try {
      const response = await chatApi.conversations.accept(tenantId, conversationId);
      console.log('[ChatContext] Accept response:', response.data.id, response.data.status);
      // Remove from queue
      setQueuedConversations((prev) => prev.filter((c) => c.id !== conversationId));
      // Add to conversations if not there
      setConversations((prev) => {
        if (prev.some((c) => c.id === conversationId)) {
          return prev.map((c) => c.id === conversationId ? response.data : c);
        }
        return [response.data, ...prev];
      });
      // Select the conversation
      await selectConversation(conversationId);
    } catch (error) {
      console.error('Failed to accept conversation:', error);
      throw error;
    }
  }, [tenantId, selectConversation]);

  // Takeover conversation
  const takeoverConversation = useCallback(async (conversationId: number) => {
    try {
      await chatApi.conversations.takeover(tenantId, conversationId);
      // Update will come via WebSocket
    } catch (error) {
      console.error('Failed to takeover conversation:', error);
      throw error;
    }
  }, [tenantId]);

  // Close conversation
  const closeConversation = useCallback(async (conversationId: number) => {
    try {
      await chatApi.conversations.close(tenantId, conversationId);
      // Update will come via WebSocket
    } catch (error) {
      console.error('Failed to close conversation:', error);
      throw error;
    }
  }, [tenantId]);

  // Transfer conversation
  const transferConversation = useCallback(async (conversationId: number, toAgentId: number, reason?: string) => {
    try {
      await chatApi.conversations.transfer(tenantId, conversationId, toAgentId, reason);
    } catch (error) {
      console.error('Failed to transfer conversation:', error);
      throw error;
    }
  }, [tenantId]);

  // Decline transferred conversation
  const declineConversation = useCallback(async (conversationId: number) => {
    try {
      await chatApi.conversations.decline(tenantId, conversationId);
      // Remove from queue - will be re-added via WebSocket event with cleared transfer metadata
      setQueuedConversations((prev) => prev.filter((c) => c.id !== conversationId));
    } catch (error) {
      console.error('Failed to decline conversation:', error);
      throw error;
    }
  }, [tenantId]);

  // Update my status
  const updateMyStatus = useCallback(async (status: AgentStatusType) => {
    try {
      await chatApi.agents.updateStatus(tenantId, status);
      setMyStatus(status);
    } catch (error) {
      console.error('Failed to update status:', error);
      throw error;
    }
  }, [tenantId]);

  // Update status mode (auto/online/away/offline)
  const updateStatusMode = useCallback(async (mode: AgentStatusMode) => {
    localStorage.setItem(`satis_status_mode_${tenantId}`, mode);
    setStatusMode(mode);

    if (mode === 'auto') {
      // Auto: set online now (will go offline on page close)
      await chatApi.agents.updateStatus(tenantId, 'online');
      setMyStatus('online');
    } else {
      // Manual: set the chosen status
      await chatApi.agents.updateStatus(tenantId, mode as AgentStatusType);
      setMyStatus(mode as AgentStatusType);
    }
  }, [tenantId]);

  // Send typing indicator
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (!activeConversation) return;

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing indicator
    chatApi.messages.sendTyping(tenantId, activeConversation.id, isTyping).catch(console.error);

    // Auto-stop typing after 3 seconds
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        chatApi.messages.sendTyping(tenantId, activeConversation.id, false).catch(console.error);
      }, 3000);
    }
  }, [tenantId, activeConversation]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async () => {
    if (!activeConversation) return;

    try {
      await chatApi.messages.markRead(tenantId, activeConversation.id);
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  }, [tenantId, activeConversation]);

  // Initial load
  useEffect(() => {
    loadTenant(tenantId);
    loadConversations();
    loadQueue();

    // Load initial online visitors count
    const loadOnlineCount = async () => {
      try {
        const response = await visitorsApi.list(tenantId, { online_only: 1, per_page: 1 } as any);
        setOnlineVisitorsCount(response.data.total);
      } catch (err) {
        console.error('Failed to load online visitors count:', err);
      }
    };
    loadOnlineCount();
  }, [tenantId, loadTenant, loadConversations, loadQueue]);

  // Track if we've done the initial restore (to prevent repeated restores)
  const hasRestoredRef = useRef<boolean>(false);

  // Restore saved conversation after initial load
  useEffect(() => {
    // Only restore once per session
    if (hasRestoredRef.current) {
      return;
    }
    hasRestoredRef.current = true;

    const savedConversationId = localStorage.getItem(`satis_inbox_conversation_${tenantId}`);
    if (savedConversationId) {
      console.log('[ChatContext] Restoring saved conversation:', savedConversationId);
      selectConversation(parseInt(savedConversationId, 10));
    }
  }, [tenantId]); // Only run once on mount, don't include selectConversation to avoid loops

  // Heartbeat to keep status alive (backend auto-marks offline after 5 min of no heartbeat)
  useEffect(() => {
    if (myStatus === 'online' || myStatus === 'away') {
      const interval = setInterval(() => {
        chatApi.agents.heartbeat(tenantId).catch(console.error);
      }, 30000); // Every 30 seconds

      return () => clearInterval(interval);
    }
  }, [tenantId, myStatus]);

  // Auto mode: go offline when page closes
  useEffect(() => {
    const handleBeforeUnload = () => {
      const mode = localStorage.getItem(`satis_status_mode_${tenantId}`) || 'auto';
      if (mode === 'auto') {
        const token = localStorage.getItem('token');
        if (token) {
          fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/tenants/${tenantId}/agents/status`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ status: 'offline' }),
            keepalive: true,
          }).catch(() => {});
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [tenantId]);

  // Clean up typing indicators older than 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers((prev) => {
        const next = new Map(prev);
        for (const [id, data] of next) {
          if (now - data.timestamp > 5000) {
            next.delete(id);
          }
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const value: ChatContextValue = {
    tenant,
    isLoadingTenant,
    conversations,
    queuedConversations,
    activeConversation,
    isLoadingConversations,
    messages,
    isLoadingMessages,
    agents,
    currentUserId,
    myStatus,
    statusMode,
    onlineAgentsCount,
    typingUsers,
    onlineVisitorsCount,
    isConnected,
    isMuted,
    notificationSettings,
    loadTenant,
    loadAgents,
    loadConversations,
    loadQueue,
    selectConversation,
    sendMessage,
    acceptConversation,
    takeoverConversation,
    closeConversation,
    transferConversation,
    declineConversation,
    updateMyStatus,
    updateStatusMode,
    sendTypingIndicator,
    markMessagesAsRead,
    toggleMute,
    loadNotificationSettings,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

// Helper function to play notification sound for new chats in queue
function playNotificationSound(isMuted: boolean, settingEnabled: boolean = true) {
  if (isMuted || !settingEnabled) return;
  if (typeof window !== 'undefined') {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {
      // Ignore errors (e.g., if user hasn't interacted with page yet)
    });
  }
}

// Base64 encoded short notification sound (same as widget)
const MESSAGE_SOUND = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRwmHAAAAAAD/+9DEAAAIAANIAAAAgAAA0gAAABBHOHgfB8HygIAmD5QEHLhgGHne7gQdFy4Py4IHB8oGP/BwfLu7u7vd3d3d3e9wQOXB8HygIPg+D5d3vd7u93/8EAQ/B8u7u7u93d7u7u7vd7u93d7hAQBB/UAALgIKCgoAAAA4EFhUBBYoAsLCwsLCwsEBAQEAgICAg4ODn//5QEP/Lg+D4Pg/KHQEBAQEH/lwfKAgICAg+D/5cH/5d3/y7vd3u93d7u9//tQxBUAAADSAAAAAAAAANIAAAAA3e7vd7vd3u7u73d7u7u7u7u73d3d3d3d7u93d3d7u7vd7u7vd3d7u7vf/+7u73d3d3d7vd3e7vd3u7u93/+93d3e7u93e7u7vd7u93d3u7u7u93u7u93d7u7vd3e7u7u93u7vd3d7';

// Helper function to play message notification sound
function playMessageSound(isMuted: boolean, settingEnabled: boolean = true) {
  if (isMuted || !settingEnabled) return;
  if (typeof window !== 'undefined') {
    try {
      const audio = new Audio(MESSAGE_SOUND);
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Fallback to Web Audio API if Audio element fails
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.value = 800;
          oscillator.type = 'sine';

          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.15);
        } catch (e) {
          // Ignore
        }
      });
    } catch (e) {
      // Ignore errors
    }
  }
}

// Helper function to play visitor notification sound (gentler than message sound)
function playVisitorSound(isMuted: boolean, settingEnabled: boolean = false) {
  console.log('[Sound] playVisitorSound called, muted:', isMuted, 'enabled:', settingEnabled);
  if (isMuted || !settingEnabled) return;
  if (typeof window !== 'undefined') {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Play two short beeps for visitor online notification
      const playBeep = (startTime: number, frequency: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.12);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.12);
      };

      // Two ascending beeps
      playBeep(audioContext.currentTime, 440);        // A4
      playBeep(audioContext.currentTime + 0.15, 554); // C#5

      console.log('[Sound] Visitor sound played');
    } catch (e) {
      console.error('[Sound] Failed to play visitor sound:', e);
    }
  }
}

export default ChatContext;

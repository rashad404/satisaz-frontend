"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import type {
  NewConversationEvent,
  ConversationAcceptedEvent,
  ConversationClosedEvent,
  NewMessageEvent,
  TypingIndicatorEvent,
  AgentStatusChangedEvent,
  AiTookOverEvent,
  HumanTookOverEvent,
  MessageReadEvent,
} from '@/lib/types/chat';

interface WebSocketConfig {
  host: string;
  port: number;
  key: string;
  authEndpoint: string;
}

type EventCallback<T> = (data: T) => void;

interface WebSocketHookOptions {
  tenantId: number;
  conversationId?: number;
  onNewConversation?: EventCallback<NewConversationEvent>;
  onConversationAccepted?: EventCallback<ConversationAcceptedEvent>;
  onConversationClosed?: EventCallback<ConversationClosedEvent>;
  onNewMessage?: EventCallback<NewMessageEvent>;
  onTypingIndicator?: EventCallback<TypingIndicatorEvent>;
  onAgentStatusChanged?: EventCallback<AgentStatusChangedEvent>;
  onAiTookOver?: EventCallback<AiTookOverEvent>;
  onHumanTookOver?: EventCallback<HumanTookOverEvent>;
  onMessageRead?: EventCallback<MessageReadEvent>;
}

export function useWebSocket(options: WebSocketHookOptions) {
  const {
    tenantId,
    conversationId,
    onNewConversation,
    onConversationAccepted,
    onConversationClosed,
    onNewMessage,
    onTypingIndicator,
    onAgentStatusChanged,
    onAiTookOver,
    onHumanTookOver,
    onMessageRead,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const echoRef = useRef<any>(null);
  const channelsRef = useRef<Set<string>>(new Set());

  // Initialize Echo connection
  const initializeEcho = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      // Dynamic import to avoid SSR issues
      const { default: Echo } = await import('laravel-echo');
      const Pusher = (await import('pusher-js')).default;

      // Make Pusher available globally for Echo
      (window as any).Pusher = Pusher;

      const config: WebSocketConfig = {
        host: process.env.NEXT_PUBLIC_REVERB_HOST || 'localhost',
        port: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8090'),
        key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || '',
        authEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/broadcasting/auth`,
      };

      console.log('[WebSocket] Initializing with config:', config);

      echoRef.current = new Echo({
        broadcaster: 'reverb',
        key: config.key,
        wsHost: config.host,
        wsPort: config.port,
        wssPort: config.port,
        forceTLS: false,
        enabledTransports: ['ws', 'wss'],
        authEndpoint: config.authEndpoint,
        auth: {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      });

      echoRef.current.connector.pusher.connection.bind('connected', () => {
        console.log('[WebSocket] Connected!');
        setIsConnected(true);
        setError(null);
      });

      echoRef.current.connector.pusher.connection.bind('disconnected', () => {
        console.log('[WebSocket] Disconnected');
        setIsConnected(false);
      });

      echoRef.current.connector.pusher.connection.bind('error', (err: Error) => {
        console.error('[WebSocket] Connection error:', err);
        setError(err.message);
        setIsConnected(false);
      });

    } catch (err) {
      console.error('[WebSocket] Failed to initialize Echo:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
    }
  }, []);

  // Subscribe to tenant channel
  const subscribeTenantChannel = useCallback(() => {
    if (!echoRef.current || !tenantId) {
      console.log('[WebSocket] Cannot subscribe to tenant - echoRef:', !!echoRef.current, 'tenantId:', tenantId);
      return;
    }

    const channelName = `tenant.${tenantId}`;
    if (channelsRef.current.has(channelName)) {
      console.log('[WebSocket] Already subscribed to:', channelName);
      return;
    }

    console.log('[WebSocket] Subscribing to tenant channel:', channelName);
    const channel = echoRef.current.private(channelName);

    channel
      .listen('.conversation.new', (e: NewConversationEvent) => {
        console.log('[WebSocket] Received conversation.new event:', e);
        onNewConversation?.(e);
      })
      .listen('.conversation.accepted', (e: ConversationAcceptedEvent) => {
        console.log('[WebSocket] Received conversation.accepted event:', e);
        onConversationAccepted?.(e);
      })
      .listen('.conversation.closed', (e: ConversationClosedEvent) => {
        console.log('[WebSocket] Received conversation.closed event:', e);
        onConversationClosed?.(e);
      })
      .listen('.message.new', (e: NewMessageEvent) => {
        console.log('[WebSocket] Received message.new on tenant channel:', e);
        onNewMessage?.(e);
      })
      .listen('.agent.status', (e: AgentStatusChangedEvent) => {
        onAgentStatusChanged?.(e);
      })
      .listen('.ai.took_over', (e: AiTookOverEvent) => {
        onAiTookOver?.(e);
      })
      .listen('.human.took_over', (e: HumanTookOverEvent) => {
        onHumanTookOver?.(e);
      });

    channelsRef.current.add(channelName);
    console.log('[WebSocket] Subscribed to tenant channel:', channelName);
  }, [tenantId, onNewConversation, onConversationAccepted, onConversationClosed, onNewMessage, onAgentStatusChanged, onAiTookOver, onHumanTookOver]);

  // Subscribe to conversation channel
  const subscribeConversationChannel = useCallback(() => {
    if (!echoRef.current || !conversationId) {
      console.log('[WebSocket] Cannot subscribe to conversation - echoRef:', !!echoRef.current, 'conversationId:', conversationId);
      return;
    }

    const channelName = `conversation.${conversationId}`;
    if (channelsRef.current.has(channelName)) {
      console.log('[WebSocket] Already subscribed to:', channelName);
      return;
    }

    console.log('[WebSocket] Subscribing to channel:', channelName);
    const channel = echoRef.current.private(channelName);

    channel
      .listen('.message.new', (e: NewMessageEvent) => {
        console.log('[WebSocket] Received message.new event:', e);
        onNewMessage?.(e);
      })
      .listen('.typing', (e: TypingIndicatorEvent) => {
        console.log('[WebSocket] Received typing event:', e);
        onTypingIndicator?.(e);
      })
      .listen('.message.read', (e: MessageReadEvent) => {
        onMessageRead?.(e);
      })
      .listen('.ai.took_over', (e: AiTookOverEvent) => {
        onAiTookOver?.(e);
      })
      .listen('.human.took_over', (e: HumanTookOverEvent) => {
        onHumanTookOver?.(e);
      });

    channelsRef.current.add(channelName);
    console.log('[WebSocket] Subscribed to:', channelName);
  }, [conversationId, onNewMessage, onTypingIndicator, onMessageRead, onAiTookOver, onHumanTookOver]);

  // Unsubscribe from conversation channel
  const unsubscribeConversation = useCallback((convId: number) => {
    if (!echoRef.current) return;

    const channelName = `conversation.${convId}`;
    echoRef.current.leave(channelName);
    channelsRef.current.delete(channelName);
  }, []);

  // Subscribe to a new conversation dynamically
  const subscribeToConversation = useCallback((convId: number, callbacks?: {
    onNewMessage?: EventCallback<NewMessageEvent>;
    onTypingIndicator?: EventCallback<TypingIndicatorEvent>;
    onMessageRead?: EventCallback<MessageReadEvent>;
  }) => {
    if (!echoRef.current) return;

    const channelName = `conversation.${convId}`;
    if (channelsRef.current.has(channelName)) return;

    const channel = echoRef.current.private(channelName);

    channel
      .listen('.message.new', (e: NewMessageEvent) => {
        callbacks?.onNewMessage?.(e);
        onNewMessage?.(e);
      })
      .listen('.typing', (e: TypingIndicatorEvent) => {
        callbacks?.onTypingIndicator?.(e);
        onTypingIndicator?.(e);
      })
      .listen('.message.read', (e: MessageReadEvent) => {
        callbacks?.onMessageRead?.(e);
        onMessageRead?.(e);
      });

    channelsRef.current.add(channelName);
  }, [onNewMessage, onTypingIndicator, onMessageRead]);

  // Initialize on mount
  useEffect(() => {
    initializeEcho();

    return () => {
      if (echoRef.current) {
        // Leave all channels
        channelsRef.current.forEach((channel) => {
          echoRef.current.leave(channel);
        });
        channelsRef.current.clear();
        echoRef.current.disconnect();
      }
    };
  }, [initializeEcho]);

  // Subscribe to tenant channel when connected
  useEffect(() => {
    if (isConnected && tenantId) {
      subscribeTenantChannel();
    }
  }, [isConnected, tenantId, subscribeTenantChannel]);

  // Subscribe to conversation channel when provided
  useEffect(() => {
    if (isConnected && conversationId) {
      subscribeConversationChannel();
    }
  }, [isConnected, conversationId, subscribeConversationChannel]);

  return {
    isConnected,
    error,
    subscribeToConversation,
    unsubscribeConversation,
  };
}

export default useWebSocket;

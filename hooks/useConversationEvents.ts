"use client";

import { useEffect, useState } from 'react';
import { conversationEventsApi } from '@/lib/api/chat';
import type { ConversationEvent } from '@/lib/types/chat';

export function useConversationEvents(tenantId?: number, conversationId?: number) {
  const [state, setState] = useState<{ conversationId?: number; events: ConversationEvent[]; failed: boolean }>({ events: [], failed: false });
  useEffect(() => {
    if (!tenantId || !conversationId) return;
    let cancelled = false;
    let loading = false;
    let cursor = 0;
    const events = new Map<number, ConversationEvent>();
    const publish = (failed = false) => {
      if (!cancelled) setState({ conversationId, events: [...events.values()], failed });
    };
    publish();
    const load = async () => {
      if (loading) return;
      loading = true;
      try {
        let page: ConversationEvent[];
        do {
          page = await conversationEventsApi.list(tenantId, conversationId, cursor);
          if (cancelled) return;
          for (const event of page) {
            events.set(event.id, event);
            cursor = Math.max(cursor, event.id);
          }
          publish();
        } while (page.length === 500);
      } catch { publish(true); }
      finally { loading = false; }
    };
    const onEvent = (raw: Event) => {
      const event = (raw as CustomEvent<ConversationEvent>).detail;
      if (event.tenant_id === tenantId && event.conversation_id === conversationId) {
        events.set(event.id, event);
        publish();
      }
    };
    window.addEventListener('chat:conversation-event', onEvent);
    void load();
    // Catch up after socket disconnects, reconnects, and missed initial subscriptions.
    const timer = setInterval(load, 5000);
    window.addEventListener('focus', load);
    return () => {
      cancelled = true;
      clearInterval(timer);
      window.removeEventListener('focus', load);
      window.removeEventListener('chat:conversation-event', onEvent);
    };
  }, [tenantId, conversationId]);
  return state.conversationId === conversationId ? state : { events: [], failed: false };
}

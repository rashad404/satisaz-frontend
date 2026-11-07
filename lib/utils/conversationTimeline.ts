import type { ChatMessage, ConversationEvent } from '@/lib/types/chat';

type Entry = { kind: 'message'; item: ChatMessage; depth: number } | { kind: 'event'; item: ConversationEvent; depth: number };

// A tool call and its result share payload.tool_use_id. Show them as one row:
// the call's start time, the result's status and duration, input and output together.
// A call without a result yet stays as its own pending row.
export function mergeToolEvents(events: ConversationEvent[]): ConversationEvent[] {
  const toolUseId = (event: ConversationEvent) => {
    const id = event.payload?.tool_use_id;
    return typeof id === 'string' && id ? id : null;
  };
  const results = new Map<string, ConversationEvent>();
  for (const event of events) {
    const id = event.type === 'tool_result' ? toolUseId(event) : null;
    if (id) results.set(id, event);
  }
  const calls = new Map<string, ConversationEvent>();
  for (const event of events) {
    const id = event.type === 'tool_call' ? toolUseId(event) : null;
    if (id && results.has(id)) calls.set(id, event);
  }
  const merged: ConversationEvent[] = [];
  for (const event of events) {
    const id = toolUseId(event);
    if (event.type === 'tool_call' && id && results.has(id)) continue;
    const call = event.type === 'tool_result' && id ? calls.get(id) : undefined;
    merged.push(call ? {
      ...event,
      created_at: call.created_at,
      payload: { input: call.payload?.input, ...event.payload },
    } : event);
  }
  return merged;
}

export function conversationTimeline(messages: ChatMessage[], rawEvents: ConversationEvent[]): Entry[] {
  const events = mergeToolEvents(rawEvents);
  const byId = new Map(events.map(event => [event.id, event]));
  const children = new Map<number, ConversationEvent[]>();
  const roots: Entry[] = messages.map(item => ({ kind: 'message', item, depth: 0 }));
  for (const event of events) {
    if (event.parent_id && event.parent_id !== event.id && byId.has(event.parent_id)) {
      children.set(event.parent_id, [...(children.get(event.parent_id) || []), event]);
    } else roots.push({ kind: 'event', item: event, depth: 0 });
  }
  const compare = (a: { created_at: string; id: number }, b: { created_at: string; id: number }) =>
    Date.parse(a.created_at) - Date.parse(b.created_at) || a.id - b.id;
  // Chat messages have second precision; events retain milliseconds. Use the
  // linked reply event to keep a fast final answer after its tool results.
  const replyTimes = new Map(events.filter(event => event.name === 'reply' && event.chat_message_id)
    .map(event => [event.chat_message_id, event.created_at]));
  const time = (entry: Entry) => entry.kind === 'message'
    ? replyTimes.get(entry.item.id) || entry.item.created_at : entry.item.created_at;
  roots.sort((a, b) => Date.parse(time(a)) - Date.parse(time(b))
    || (a.kind !== b.kind ? (a.kind === 'message' ? -1 : 1) : a.item.id - b.item.id));
  const result: Entry[] = [];
  const seen = new Set<number>();
  const append = (entry: Entry) => {
    if (entry.kind === 'event') {
      if (seen.has(entry.item.id)) return;
      seen.add(entry.item.id);
    }
    result.push(entry);
    if (entry.kind === 'event') {
      for (const child of (children.get(entry.item.id) || []).sort(compare)) {
        append({ kind: 'event', item: child, depth: entry.depth + 1 });
      }
    }
  };
  roots.forEach(append);
  // Malformed historical cycles cannot hide events or recurse forever.
  events.filter(event => !seen.has(event.id)).sort(compare).forEach(item => append({ kind: 'event', item, depth: 0 }));
  return result;
}

"use client";

import { useTranslations, useLocale } from 'next-intl';
import { Bot, User, Terminal, ShieldCheck, AlertCircle, Wrench } from 'lucide-react';
import type { ConversationEvent } from '@/lib/types/chat';

export function ConversationEventRow({ event, depth = 0 }: { event: ConversationEvent; depth?: number }) {
  const t = useTranslations('ws.chat.steps');
  const locale = useLocale();
  const Icon = event.type === 'error' ? AlertCircle
    : event.type.startsWith('approval') ? ShieldCheck
    : event.actor === 'helper' ? Terminal
    : event.type.startsWith('tool_') ? Wrench
    : event.actor === 'aysel' ? Bot : User;
  // Aysel's own steps are shown in the viewer's language from their type and name.
  // The stored summary is only a fallback (helper steps carry their own free text).
  const tool = event.type === 'tool_call' || event.type === 'tool_result';
  const label = tool
    ? (event.name && t.has(`tools.${event.name}`) ? t(`tools.${event.name}`) : t('tools.other', { name: event.name || '' }))
    : event.name === 'reply' ? t('reply')
    : event.type === 'error' && event.name && t.has(`errors.${event.name}`) ? t(`errors.${event.name}`)
    : event.actor === 'aysel' ? t(`types.${event.type}`)
    : event.summary || t(`types.${event.type}`);
  return (
    <details className="min-w-0 rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300" style={{ marginLeft: Math.min(depth, 4) * 12 }}>
      <summary className="cursor-pointer rounded-lg p-2 focus-visible:outline-purple-500">
        <span className="inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 align-middle">
          <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="font-medium">{t(`actors.${event.actor}`)}</span>
          <span className="min-w-0 break-words">{label}</span>
          {event.duration_ms !== null && <span className="whitespace-nowrap">{t('duration', { ms: event.duration_ms })}</span>}
          <span className={event.status === 'error' ? 'text-red-600 dark:text-red-400' : event.status === 'pending' ? 'text-amber-700 dark:text-amber-400' : 'text-green-700 dark:text-green-400'}>{t(`statuses.${event.status}`)}</span>
          <time className="text-gray-400" dateTime={event.created_at}>{new Date(event.created_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</time>
        </span>
      </summary>
      <div className="min-w-0 space-y-2 border-t border-gray-200 p-3 dark:border-gray-700">
        <p>{t(`types.${event.type}`)}{event.name && <span className="ml-2 break-all font-mono">{event.name}</span>}</p>
        {event.actor !== 'aysel' && event.summary && event.summary !== label && <p className="break-words">{event.summary}</p>}
        {Object.entries(event.payload || {}).map(([key, value]) => (
          <div key={key}>
            <div className="mb-1 font-medium">{['input', 'output', 'command', 'stdout', 'tool_use_id'].includes(key) ? t(`fields.${key}`) : key}</div>
            <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-all rounded bg-white p-2 font-mono dark:bg-gray-900">{typeof value === 'string' ? value : JSON.stringify(value, null, 2)}</pre>
          </div>
        ))}
        {Object.keys(event.payload || {}).length === 0 && <p>{t('noPayload')}</p>}
      </div>
    </details>
  );
}

"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useChat } from '@/contexts/ChatContext';
import { aiReviewApi } from '@/lib/api/chat';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import {
  Sparkles, Send, Pencil, RefreshCw, UserCheck, SkipForward, Loader2, Check, X,
  Clock, Globe, ShieldCheck, History, GraduationCap, Inbox as InboxIcon,
} from 'lucide-react';
import type { AiDraft, AiLesson } from '@/lib/types/chat';

type Tab = 'queue' | 'lessons' | 'history';

type T = ReturnType<typeof useTranslations>;

function timeAgo(iso: string | null | undefined, t: T): string {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.round(ms / 60000);
  if (m < 1) return t('time.now');
  if (m < 60) return t('time.minutesAgo', { n: m });
  const h = Math.round(m / 60);
  if (h < 48) return t('time.hoursAgo', { n: h });
  return t('time.daysAgo', { n: Math.round(h / 24) });
}

const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

function msgTime(iso: string | null | undefined, t: T): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const year = d.getFullYear() !== new Date().getFullYear() ? ` ${d.getFullYear()}` : '';
  return `${d.getDate()} ${t(`months.${MONTH_KEYS[d.getMonth()]}`)}${year}, ${hm}`;
}

const STATUS_KEYS = ['pending', 'regenerating', 'approved', 'edited', 'skipped', 'taken_over', 'superseded', 'auto_sent'];

export default function AyselReviewPage() {
  const t = useTranslations('ws.aysel');
  const params = useParams();
  const tenantId = Number(params.tenantId);
  const lang = (params.lang as string) || 'az';
  const { aiDrafts, aiReviewMode, setAiReviewMode, refreshAiDrafts, aiLessonEvent } = useChat();

  const [tab, setTab] = useState<Tab>('queue');
  const [modeSaving, setModeSaving] = useState(false);
  const [history, setHistory] = useState<AiDraft[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyMeta, setHistoryMeta] = useState<{ total: number; last_page: number }>({ total: 0, last_page: 1 });
  const [lessons, setLessons] = useState<AiLesson[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { refreshAiDrafts(); }, [refreshAiDrafts]);

  const loadLessons = useCallback(async () => {
    try { const r = await aiReviewApi.lessons(tenantId, 'all'); setLessons(r.data); } catch (e) { console.error(e); }
  }, [tenantId]);
  const loadHistory = useCallback(async () => {
    try {
      const r = await aiReviewApi.listDrafts(tenantId, 'history', 50, historyPage);
      setHistory(r.data);
      setHistoryMeta({ total: r.meta?.total ?? r.data.length, last_page: r.meta?.last_page ?? 1 });
    } catch (e) { console.error(e); }
  }, [tenantId, historyPage]);

  useEffect(() => { if (tab === 'lessons') loadLessons(); if (tab === 'history') loadHistory(); }, [tab, loadLessons, loadHistory]);
  useEffect(() => { if (aiLessonEvent) loadLessons(); }, [aiLessonEvent, loadLessons]);

  const toggleMode = async () => {
    setModeSaving(true); setError(null);
    try { await setAiReviewMode(!aiReviewMode); } catch { setError(t('modeError')); } finally { setModeSaving(false); }
  };

  const proposedLessons = useMemo(() => lessons.filter(l => l.status === 'proposed'), [lessons]);
  const acceptedLessons = useMemo(() => lessons.filter(l => l.status === 'accepted'), [lessons]);

  return (
    <div className="h-full overflow-y-auto">
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Aysel</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
          </div>
        </div>
        <button
          onClick={toggleMode}
          disabled={modeSaving}
          className={cn(
            'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition-colors',
            aiReviewMode
              ? 'bg-purple-600 text-white border-purple-600'
              : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700'
          )}
          title={t('modeHint')}
        >
          {modeSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          {aiReviewMode ? t('modeReview') : t('modeAuto')}
        </button>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-4 py-2 text-sm">{error}</div>}

      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800 mb-5">
        {([
          ['queue', t('tabs.queue'), InboxIcon, aiDrafts.length],
          ['lessons', t('tabs.lessons'), GraduationCap, proposedLessons.length],
          ['history', t('tabs.history'), History, 0],
        ] as const).map(([key, label, Icon, count]) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn('flex items-center gap-2 px-4 py-2 text-sm border-b-2 -mb-px',
              tab === key ? 'border-purple-600 text-purple-700 dark:text-purple-300' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200')}>
            <Icon className="h-4 w-4" /> {label}
            {count > 0 && <span className="rounded-full bg-purple-600 text-white text-xs px-2 py-0.5">{count}</span>}
          </button>
        ))}
      </div>

      {tab === 'queue' && (
        aiDrafts.length === 0 ? (
          <EmptyState text={aiReviewMode ? t('queueEmptyReview') : t('queueEmptyAuto')} />
        ) : (
          <div className="space-y-5">
            {aiDrafts.map(d => <DraftCard key={d.id} draft={d} tenantId={tenantId} lang={lang} onError={setError} />)}
          </div>
        )
      )}

      {tab === 'lessons' && (
        <div className="space-y-6">
          <section>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('proposedTitle')}</h2>
            {proposedLessons.length === 0 ? <p className="text-sm text-gray-500">{t('proposedEmpty')}</p> : (
              <div className="space-y-2">
                {proposedLessons.map(l => <LessonRow key={l.id} lesson={l} tenantId={tenantId} onDone={loadLessons} />)}
              </div>
            )}
          </section>
          <section>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('acceptedTitle', { n: acceptedLessons.length })}</h2>
            {acceptedLessons.length === 0 ? <p className="text-sm text-gray-500">{t('acceptedEmpty')}</p> : (
              <ul className="space-y-1">
                {acceptedLessons.map(l => (
                  <li key={l.id} className="text-sm text-gray-800 dark:text-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 px-3 py-2">
                    <span className={cn('text-xs mr-2 rounded px-1.5 py-0.5', l.type === 'fact' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800')}>{l.type === 'fact' ? t('lessonFact') : t('lessonRule')}</span>
                    {l.text}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {tab === 'history' && (
        history.length === 0 ? <EmptyState text={t('historyEmpty')} /> : (
          <div className="space-y-2">
            <Pager page={historyPage} lastPage={historyMeta.last_page} total={historyMeta.total} onPage={setHistoryPage} />
            {history.map(d => (
              <div key={d.id} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-1">
                  <a className="font-medium text-purple-700 dark:text-purple-300 hover:underline" href={`/${lang}/workspaces/${tenantId}/inbox?conversation=${d.conversation_id}`}>#{d.conversation_id}</a>
                  <span>{d.visitor?.name || t('guest')}</span>
                  <span className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5">{STATUS_KEYS.includes(d.status) ? t(`status.${d.status}`) : d.status}</span>
                  <span>{timeAgo(d.reviewed_at || d.updated_at, t)}</span>
                </div>
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{d.final_text || d.draft}</p>
              </div>
            ))}
            <Pager page={historyPage} lastPage={historyMeta.last_page} total={historyMeta.total} onPage={(p) => { setHistoryPage(p); }} />
          </div>
        )
      )}
    </div>
    </div>
  );
}

function Pager({ page, lastPage, total, onPage }: { page: number; lastPage: number; total: number; onPage: (p: number) => void }) {
  const t = useTranslations('ws.aysel');
  if (lastPage <= 1) return <p className="text-xs text-gray-500">{t('total', { total })}</p>;
  return (
    <div className="flex items-center justify-between text-sm py-1">
      <span className="text-xs text-gray-500">{t('totalPaged', { total, page, lastPage })}</span>
      <div className="flex gap-2">
        <button onClick={() => onPage(page - 1)} disabled={page <= 1}
          className="rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1 disabled:opacity-40">{t('prev')}</button>
        <button onClick={() => onPage(page + 1)} disabled={page >= lastPage}
          className="rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1 disabled:opacity-40">{t('next')}</button>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-10 text-center text-sm text-gray-500 dark:text-gray-400">{text}</div>
  );
}

function DraftCard({ draft, tenantId, lang, onError }: { draft: AiDraft; tenantId: number; lang: string; onError: (m: string | null) => void }) {
  const t = useTranslations('ws.aysel');
  const [text, setText] = useState(draft.draft);
  const [suggestion, setSuggestion] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [showSuggest, setShowSuggest] = useState(false);

  // A regenerated draft arrives as a new draft (new id), so a stale card is simply removed by the context.
  useEffect(() => { setText(draft.draft); }, [draft.draft]);

  const edited = text.trim() !== draft.draft.trim();
  const regenerating = draft.status === 'regenerating';

  const run = async (name: string, fn: () => Promise<unknown>) => {
    setBusy(name); onError(null);
    try { await fn(); } catch (e: any) { onError(e?.response?.data?.message || t('actionFailed')); } finally { setBusy(null); }
  };

  const sendNow = () => run('send', () => edited ? aiReviewApi.edit(tenantId, draft.id, text.trim()) : aiReviewApi.approve(tenantId, draft.id));
  const sendSuggestion = () => {
    const s = suggestion.trim(); if (!s) return;
    run('suggest', async () => { await aiReviewApi.suggest(tenantId, draft.id, s); setSuggestion(''); setShowSuggest(false); });
  };

  return (
    <div className={cn('rounded-xl border bg-white dark:bg-gray-900 shadow-sm overflow-hidden', regenerating ? 'border-purple-300 dark:border-purple-800' : 'border-gray-200 dark:border-gray-800')}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
        <a className="font-semibold text-purple-700 dark:text-purple-300 hover:underline" href={`/${lang}/workspaces/${tenantId}/inbox?conversation=${draft.conversation_id}`}>#{draft.conversation_id}</a>
        <span className="font-medium text-gray-800 dark:text-gray-200">{draft.visitor?.name || t('guest')}</span>
        {draft.visitor?.is_verified && <span className="inline-flex items-center gap-1 text-green-700"><ShieldCheck className="h-3 w-3" /> {t('verified')}</span>}
        {draft.source && <span className="inline-flex items-center gap-1"><Globe className="h-3 w-3" /> {draft.source === 'ureb' ? 'ureb.com' : 'sayt.az'}</span>}
        {draft.page_url && <span className="truncate max-w-[260px]" title={draft.page_url}>{draft.page_url.replace(/^https?:\/\//, '')}</span>}
        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {t('lastMessage', { time: timeAgo(draft.last_visitor_at, t) })}</span>
        {draft.round > 1 && <span className="rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-1.5 py-0.5">{t('variant', { n: draft.round })}</span>}
        {regenerating && <span className="inline-flex items-center gap-1 text-purple-600"><Loader2 className="h-3 w-3 animate-spin" /> {t('rewriting')}</span>}
      </div>

      <div className="grid md:grid-cols-2 gap-0 md:divide-x divide-gray-100 dark:divide-gray-800">
        <div className="p-4 space-y-2 max-h-80 overflow-y-auto bg-gray-50/60 dark:bg-gray-950/40">
          {(draft.transcript?.length ? draft.transcript : [{ role: 'visitor', content: draft.visitor_text || '' }]).map((m, i) => (
            <div key={i} className={cn('flex flex-col', m.role === 'visitor' ? 'items-start' : 'items-end')}>
              <div className={cn('max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap',
                m.role === 'visitor' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700' : 'bg-purple-600 text-white')}>
                {m.content}
              </div>
              {(m as any).at && <span className="mt-0.5 px-1 text-[10px] text-gray-400">{msgTime((m as any).at, t)}</span>}
            </div>
          ))}
        </div>

        <div className="p-4 flex flex-col gap-3">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('replyLabel')} {edited && <span className="text-amber-600">{t('editedMark')}</span>}</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={regenerating || !!busy}
            rows={6}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {draft.suggestions?.length > 0 && (
            <p className="text-xs text-gray-500">{t('suggestions', { list: draft.suggestions.join(' | ') })}</p>
          )}
          {!!(draft.metadata as any)?.no_reply && (
            <p className="text-xs rounded-lg bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-2">
              {t('noReply', { reason: (draft.metadata as any).no_reply.reason })}
            </p>
          )}
          {!!(draft.metadata as any)?.escalation && (
            <p className="text-xs rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-3 py-2">
              {t('escalation', { reason: (draft.metadata as any).escalation.reason })}
              {(draft.metadata as any).escalation.summary ? ` — ${(draft.metadata as any).escalation.summary}` : ''}
              <span className="block mt-1 text-amber-700 dark:text-amber-300">{t('escalationHint')}</span>
            </p>
          )}

          {showSuggest && (
            <div className="flex gap-2">
              <input
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendSuggestion(); }}
                placeholder={t('suggestPlaceholder')}
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
                autoFocus
              />
              <button onClick={sendSuggestion} disabled={!suggestion.trim() || !!busy} className="rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 text-sm disabled:opacity-50">
                {busy === 'suggest' ? <Loader2 className="h-4 w-4 animate-spin" /> : t('send')}
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-auto">
            <button onClick={sendNow} disabled={regenerating || !!busy || !text.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 text-sm font-medium disabled:opacity-50">
              {busy === 'send' ? <Loader2 className="h-4 w-4 animate-spin" /> : (edited ? <Pencil className="h-4 w-4" /> : <Send className="h-4 w-4" />)}
              {edited ? t('sendEdited') : t('send')}
            </button>
            <button onClick={() => setShowSuggest(v => !v)} disabled={regenerating || !!busy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">
              <RefreshCw className="h-4 w-4" /> {t('suggest')}
            </button>
            <button onClick={() => run('takeover', () => aiReviewApi.takeover(tenantId, draft.id))} disabled={!!busy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">
              {busy === 'takeover' ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />} {t('takeOver')}
            </button>
            <button onClick={() => run('skip', () => aiReviewApi.skip(tenantId, draft.id))} disabled={regenerating || !!busy}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50">
              <SkipForward className="h-4 w-4" /> {t('skip')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LessonRow({ lesson, tenantId, onDone }: { lesson: AiLesson; tenantId: number; onDone: () => void }) {
  const t = useTranslations('ws.aysel');
  const [text, setText] = useState(lesson.text);
  const [busy, setBusy] = useState(false);
  const decide = async (decision: 'accept' | 'reject') => {
    setBusy(true);
    try { await aiReviewApi.reviewLesson(tenantId, lesson.id, decision, text.trim() || undefined); onDone(); } finally { setBusy(false); }
  };
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 flex flex-col md:flex-row md:items-center gap-2">
      <span className={cn('text-xs rounded px-1.5 py-0.5 shrink-0', lesson.type === 'fact' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800')}>{lesson.type === 'fact' ? t('lessonFact') : t('lessonRule')}</span>
      <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-1.5 text-sm" />
      <div className="flex gap-2 shrink-0">
        <button onClick={() => decide('accept')} disabled={busy} className="inline-flex items-center gap-1 rounded-lg bg-green-600 text-white px-3 py-1.5 text-sm disabled:opacity-50"><Check className="h-4 w-4" /> {t('accept')}</button>
        <button onClick={() => decide('reject')} disabled={busy} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm disabled:opacity-50"><X className="h-4 w-4" /> {t('reject')}</button>
      </div>
    </div>
  );
}

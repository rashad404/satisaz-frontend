import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Compile only the pure timeline utility using the project's existing TypeScript.
const source = readFileSync(new URL('../lib/utils/conversationTimeline.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
const { conversationTimeline } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const message = (id, time) => ({ id, created_at: `2026-11-07T12:00:${time}Z`, sender_type: 'visitor' });
const event = (id, time, extra = {}) => ({ id, created_at: `2026-11-07T12:00:${time}Z`, parent_id: null, ...extra });

test('merges out-of-order arrivals and keeps millisecond tool events before a linked reply', () => {
  const result = conversationTimeline([message(10, '00.000'), message(11, '01.000')], [
    event(3, '01.900', { name: 'reply', chat_message_id: 11 }),
    event(2, '01.800', { type: 'tool_result' }),
    event(1, '01.100', { type: 'tool_call' }),
  ]);
  assert.deepEqual(result.map(e => `${e.kind}:${e.item.id}`), ['message:10', 'event:1', 'event:2', 'message:11', 'event:3']);
});

test('nests children, keeps orphan events, and tolerates cycles', () => {
  const result = conversationTimeline([], [
    event(2, '02.000', { parent_id: 1 }), event(1, '01.000'),
    event(3, '03.000', { parent_id: 999 }),
    event(4, '04.000', { parent_id: 5 }), event(5, '05.000', { parent_id: 4 }),
  ]);
  assert.deepEqual(result.slice(0, 3).map(e => [e.item.id, e.depth]), [[1, 0], [2, 1], [3, 0]]);
  assert.equal(new Set(result.map(e => e.item.id)).size, 5);
  assert.equal(result.length, 5);
});

test('steps off leaves chronological messages', () => {
  assert.deepEqual(conversationTimeline([message(2, '02.000'), message(1, '01.000')], []).map(e => e.item.id), [1, 2]);
});

test('merges a tool call with its result into one row', async () => {
  const { mergeToolEvents } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
  const merged = mergeToolEvents([
    event(1, '01.000', { type: 'tool_call', status: 'pending', payload: { input: { q: 'x' }, tool_use_id: 'a' } }),
    event(2, '01.500', { type: 'tool_result', status: 'ok', duration_ms: 500, payload: { output: [1], tool_use_id: 'a' } }),
    event(3, '02.000', { type: 'tool_call', status: 'pending', payload: { input: {}, tool_use_id: 'b' } }),
  ]);
  assert.deepEqual(merged.map(e => e.id), [2, 3]);
  assert.equal(merged[0].created_at, '2026-11-07T12:00:01.000Z');
  assert.deepEqual(merged[0].payload, { input: { q: 'x' }, output: [1], tool_use_id: 'a' });
});

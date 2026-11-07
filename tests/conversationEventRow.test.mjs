import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { NextIntlClientProvider } from 'next-intl';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const source = readFileSync(new URL('../components/chat/ConversationEventRow.tsx', import.meta.url), 'utf8');
let { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } });
outputText = outputText.replace(/from ["']([^"']+)["']/g, (_, specifier) => `from ${JSON.stringify(pathToFileURL(require.resolve(specifier)).href)}`);
const { ConversationEventRow } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

for (const locale of ['az', 'en', 'ru']) {
  test(`event row renders translated labels and escaped payloads in ${locale}`, () => {
    const messages = JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), 'utf8'));
    const errors = [];
    const event = { id: 1, actor: 'aysel', type: 'tool_result', name: 'get_knowledge', summary: 'Knowledge loaded', status: 'ok', duration_ms: 12, created_at: '2026-11-07T12:00:00Z', payload: { output: { text: '<script>alert(1)</script>' } } };
    const html = renderToStaticMarkup(React.createElement(NextIntlClientProvider, { locale, messages, timeZone: 'UTC', onError: error => errors.push(error.message) }, React.createElement(ConversationEventRow, { event, depth: 1 })));
    assert.deepEqual(errors, []);
    assert.match(html, /<details/);
    assert.doesNotMatch(html, /<details[^>]*\sopen/);
    assert.match(html, /margin-left:12px/);
    assert.match(html, /&lt;script&gt;/);
    assert.ok(html.includes(messages.ws.chat.steps.fields.output));
    assert.ok(html.includes(messages.ws.chat.steps.statuses.ok));
  });
}

# Design: Custom OpenAI-Compatible Provider

**Date:** 2026-09-12
**Status:** Approved
**Workstream:** ws:agent-chat / ws:integration (settings)

## Problem

DOMinic's Settings screen hardcodes four providers: OpenAI, Anthropic, Google, DeepSeek. Any OpenAI-compatible endpoint that is not one of these — OpenRouter, Azure OpenAI gateways, an internal proxy, Ollama, LM Studio, vLLM — cannot be used as a first-class provider. Users would have to abuse the "OpenAI" slot and hope the model field carries the gateway-specific name.

The plumbing mostly exists on main already:

- `useSettingsStore` persists `baseUrl` in `system/settings.json` (VFS) and hydrates it back.
- `useAgentChat` sends `baseUrl` in the chat request body.
- `/api/chat` accepts `clientBaseUrl` and uses it when constructing the OpenAI-style provider for the `deepseek` branch and the default `openai` branch.

What is missing is a provider identity for "any OpenAI-compatible endpoint" and the UI/route handling to select and validate it.

## Decisions (from brainstorming Q&A)

| Question | Decision |
| --- | --- |
| Primary scenario | General feature, post-hackathon quality — not tied to one endpoint |
| Settings UX | Add a fifth "Custom (OpenAI-compatible)" provider card; existing four untouched |
| Route handling | New `'custom'` provider branch in `/api/chat` |
| Server env fallback | None — base URL comes from the client only |
| Validation | Require non-empty `baseUrl` and `model`; lenient URL format (no http(s) policing, no trailing-slash rules) |

## Design

### 1. Type layer

Extend the provider union in the two places it is literally defined:

- `app/features/settings/stores/settings.ts:4`
  ```ts
  export type LlmProvider = 'openai' | 'anthropic' | 'google' | 'deepseek' | 'custom'
  ```
- `app/features/chat/types/chat.ts:20` — same union.

No store shape changes: `SettingsState` already has `provider`, `model`, `apiKey`, `baseUrl`, and `hasHydrated`.

### 2. Settings UI — `app/features/settings/components/SettingsApp.vue`

- Add a fifth entry to the local `providers` array:
  ```ts
  { id: 'custom', name: 'Custom', icon: '🔌', defaultModel: '' }
  ```
- `selectProvider('custom')` sets the model input to `''` (the user must supply a model name; no silent default).
- The Base URL input already exists. When `custom` is selected it becomes required, with helper text: "OpenAI-compatible endpoint, e.g. https://openrouter.ai/api/v1". Existing four providers keep current behavior (base URL remains optional, used only where the route honors it today).
- `save()` validation: if `selectedProvider === 'custom'` and (`baseUrlInput` is empty **or** `modelInput` is empty) → show an inline red error and do not save.
- The card grid, hydration, and save flow are otherwise unchanged.

### 3. Chat route — `server/api/chat.post.ts`

Add a `custom` branch ahead of the default OpenAI branch:

1. API key: client key only — no env fallback. The existing 401 check ("No API key provided for custom…") catches a missing key with a clear message.
2. Base URL: must be a non-empty `clientBaseUrl`, else 400: `"Custom provider requires a Base URL in Settings"`.
3. Model: must be a non-empty `requestedModel`, else 400: `"Custom provider requires a model"`.
4. Construct the model:
   ```ts
   const custom = createOpenAI({ apiKey, baseURL: clientBaseUrl })
   modelInstance = custom(requestedModel)
   ```

Lenient by design: no URL-format policing (Ollama uses `http://localhost:11434/v1`, LM Studio `http://localhost:1234/v1`, gateways vary), no trailing-slash normalization, no connectivity probing.

The chat composable (`useAgentChat`) already forwards `provider/model/apiKey/baseUrl` from `getProviderConfig` — zero client chat changes.

### 4. Error handling

| Case | Result |
| --- | --- |
| Custom selected, no baseUrl in Settings | Save blocked client-side with inline error; route 400 if bypassed |
| Custom selected, no model | Same |
| No API key | Existing 401 with provider name |
| Upstream endpoint rejects key/model/path | AI SDK error propagates as today (`e:` data-stream error prefix) |

### 5. Testing / verification

- `npx vue-tsc --noEmit` — clean.
- Dev server: select Custom, attempt save with missing URL or model → blocked with inline error.
- `curl -X POST /api/chat` with `{ provider: 'custom', apiKey: 'k', model: 'm' }` and no baseUrl → expect 400.
- Same body with `baseUrl` pointed at a real compatible endpoint and a bogus key → expect upstream error shape (proves request passthrough and correct baseURL wiring).
- Regression: existing four providers unchanged (openai default still honors `OPENAI_BASE_URL` env fallback; deepseek still honors `DEEPSEEK_API_URL`).

### Scope notes

- Strictly additive: the demo freeze (#32) is closed and the existing four provider paths are untouched.
- Follow-ups intentionally out of scope: per-provider base-URL fields for all providers, model-list fetch from the endpoint, connectivity test button.

## Files touched

- `app/features/settings/stores/settings.ts` (union)
- `app/features/chat/types/chat.ts` (union)
- `app/features/settings/components/SettingsApp.vue` (card + validation + helper text)
- `server/api/chat.post.ts` (custom branch)
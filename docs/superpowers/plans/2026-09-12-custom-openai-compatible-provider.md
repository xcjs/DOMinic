# Custom OpenAI-Compatible Provider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fifth "Custom" provider so any OpenAI-compatible endpoint (OpenRouter, Ollama, LM Studio, internal gateways) works as a first-class provider in DOMinic's Settings and `/api/chat`.

**Architecture:** Extend the `LlmProvider` union with `'custom'` in both definition sites, add a Custom provider card + save-time validation to SettingsApp.vue, and add a `custom` branch to `server/api/chat.post.ts` that constructs `createOpenAI({ apiKey, baseURL: clientBaseUrl })`. The chat composable already forwards `baseUrl`, so no client chat changes are needed.

**Tech Stack:** Nuxt 4 (Vue 3 SFC + Pinia), AI SDK v4 (`@ai-sdk/openai` `createOpenAI`), Tailwind utility classes.

**Spec:** `docs/superpowers/specs/2026-09-12-custom-openai-compatible-provider-design.md`

## Global Constraints

- Strict TypeScript: `npx vue-tsc --noEmit` must pass with zero errors after every task.
- AI SDK v4 conventions: tools use `parameters` (not `inputSchema`); route returns `result.toDataStreamResponse()`. Do not migrate to v5.
- No env fallback for the custom provider's base URL — client-sent `baseUrl` only.
- Lenient URL handling: no http(s)-prefix policing, no trailing-slash normalization.
- Existing four providers (openai/anthropic/google/deepseek) must keep byte-identical behavior.
- Style: match existing file conventions — single quotes in `.ts`/SFC script blocks, Tailwind utility classes, no comments unless mirroring adjacent ones.
- This repo has no unit-test runner wired; verification is typecheck + dev-server curl/UI checks (per spec's Testing section).

---

### Task 1: Extend the provider union (both definition sites)

**Files:**
- Modify: `app/features/settings/stores/settings.ts:4`
- Modify: `app/features/chat/types/chat.ts:20` (`ProviderConfig.provider`)

**Interfaces:**
- Consumes: nothing (leaf change).
- Produces: `export type LlmProvider = 'openai' | 'anthropic' | 'google' | 'deepseek' | 'custom'` (settings.ts) and `ProviderConfig.provider` accepting `'custom'` (chat.ts). All later tasks rely on these unions.

- [ ] **Step 1: Update the union in settings.ts**

In `app/features/settings/stores/settings.ts`, change line 4 from:

```ts
export type LlmProvider = 'openai' | 'anthropic' | 'google' | 'deepseek'
```

to:

```ts
export type LlmProvider = 'openai' | 'anthropic' | 'google' | 'deepseek' | 'custom'
```

- [ ] **Step 2: Update ProviderConfig in chat.ts**

In `app/features/chat/types/chat.ts`, change the `ProviderConfig` interface's provider field from:

```ts
export interface ProviderConfig {
  provider: 'openai' | 'anthropic' | 'google' | 'deepseek'
  model: string
  apiKey: string
  baseUrl?: string
}
```

to:

```ts
export interface ProviderConfig {
  provider: 'openai' | 'anthropic' | 'google' | 'deepseek' | 'custom'
  model: string
  apiKey: string
  baseUrl?: string
}
```

- [ ] **Step 3: Typecheck**

Run: `npx vue-tsc --noEmit`
Expected: zero errors (unions are additive; no existing `switch` on provider exhaustiveness exists in the client).

- [ ] **Step 4: Commit**

```powershell
git add app/features/settings/stores/settings.ts app/features/chat/types/chat.ts
git commit -m "feat(settings): allow 'custom' in LlmProvider and ProviderConfig unions"
```

---

### Task 2: Settings UI — Custom card, required fields, inline validation

**Files:**
- Modify: `app/features/settings/components/SettingsApp.vue` (providers array ~line 123; script validation in `save()`; Base URL template block ~lines 71-81; optional error banner near Save button ~line 85)

**Interfaces:**
- Consumes: `LlmProvider` including `'custom'` (Task 1), `useSettingsStore.saveSettings(updates: Partial<Omit<SettingsState, 'hasHydrated'>>)` unchanged.
- Produces: providers array entry `{ id: 'custom', name: 'Custom', icon: '🔌', defaultModel: '' }`; local ref `baseUrlError = ref('')`; behavior contract — `save()` is a no-op with `baseUrlError` set when `selectedProvider === 'custom'` and `baseUrlInput` or `modelInput` is empty.

- [ ] **Step 1: Add the Custom provider card entry**

In the `providers` array inside `<script setup>`, append:

```ts
const providers: { id: LlmProvider; name: string; icon: string; defaultModel: string }[] = [
  { id: 'openai', name: 'OpenAI', icon: '⚡', defaultModel: 'gpt-5' },
  { id: 'anthropic', name: 'Anthropic', icon: '🧠', defaultModel: 'claude-sonnet-5' },
  { id: 'google', name: 'Google', icon: '✨', defaultModel: 'gemini-2.5-pro' },
  { id: 'deepseek', name: 'DeepSeek', icon: '🐋', defaultModel: 'deepseek-chat' },
  { id: 'custom', name: 'Custom', icon: '🔌', defaultModel: '' }
]
```

- [ ] **Step 2: Make selectProvider handle the empty default model**

`selectProvider` already writes `modelInput.value = preset.defaultModel`, so Custom correctly empties the field. No change needed — verify by reading the function; do not add special cases.

- [ ] **Step 3: Add validation state and update save()**

Add near the other refs (after `const baseUrlInput = ref('')`):

```ts
const baseUrlError = ref('')
```

Replace the existing `save()` with:

```ts
function save() {
  if (selectedProvider.value === 'custom' && (!baseUrlInput.value.trim() || !modelInput.value.trim())) {
    baseUrlError.value = 'Custom provider requires a Base URL and a model identifier.'
    return
  }
  baseUrlError.value = ''
  settingsStore.saveSettings({
    provider: selectedProvider.value,
    model: modelInput.value,
    apiKey: apiKeyInput.value,
    baseUrl: baseUrlInput.value
  })

  savedNotice.value = true
  setTimeout(() => {
    savedNotice.value = false
  }, 2500)
}
```

Also clear the error when the user switches provider or edits the inputs: in `selectProvider` add `baseUrlError.value = ''` as its first line, and add `@input="baseUrlError = ''"` to both the model input and the Base URL input elements.

- [ ] **Step 4: Update the Base URL block for required-when-custom**

Replace the existing `<!-- Custom Base URL (Optional) -->` block with:

```html
      <!-- Custom Base URL -->
      <div class="space-y-1.5">
        <label class="text-xs text-slate-300 font-medium">
          Custom Base URL <span v-if="selectedProvider === 'custom'" class="text-rose-400">(required)</span>
          <span v-else class="text-slate-500">(Optional)</span>
        </label>
        <input
          v-model="baseUrlInput"
          type="text"
          :placeholder="selectedProvider === 'custom' ? 'https://openrouter.ai/api/v1' : 'https://api.openai.com/v1 or custom proxy'"
          class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
          @input="baseUrlError = ''"
        />
        <span v-if="selectedProvider === 'custom'" class="text-[11px] text-slate-500">
          Any OpenAI-compatible endpoint, e.g. https://openrouter.ai/api/v1, http://localhost:11434/v1
        </span>
      </div>
```

- [ ] **Step 5: Show the inline error near the Save button**

Inside the Save Button block, directly after the `savedNotice` span, add:

```html
        <span v-if="baseUrlError" class="text-xs text-rose-400">
          {{ baseUrlError }}
        </span>
```

- [ ] **Step 6: Typecheck**

Run: `npx vue-tsc --noEmit`
Expected: zero errors.

- [ ] **Step 7: Manual UI verification (dev server)**

If a dev server is already listening on port 3000, kill only its owning process:
```powershell
$conn = Get-NetTCPConnection -LocalPort 3000 -State Listen | Select-Object -First 1
if ($conn) { Stop-Process -Id $conn.OwningProcess -Force }
```
Then start it (log outside the repo), wait ~25 s (cold vue-tsc can exceed 20 s; retry once if the first boot fails):
```powershell
Start-Process cmd -WindowStyle Hidden -ArgumentList '/c npm run dev > C:\Users\Zack\Projects\dominic-dev.log 2>&1'
```
Verify via `Get-Content C:\Users\Zack\Projects\dominic-dev.log -Tail 5` that it bound, then:
- `GET http://localhost:3000/` returns 200 and the Settings window opens in-app: five provider cards render including "🔌 Custom".
- Selecting Custom: Model Identifier empties, Base URL label shows "(required)" with helper text.
- Clicking Save with empty Base URL or model → red inline error, no "Saved" notice.
- Filling both and saving → "✓ Saved to local storage".

- [ ] **Step 8: Commit**

```powershell
git add app/features/settings/components/SettingsApp.vue
git commit -m "feat(settings): Custom provider card with required base URL and model validation"
```

---

### Task 3: Chat route — `custom` branch

**Files:**
- Modify: `server/api/chat.post.ts` (API-key resolution block ~lines 26-41; provider construction chain ~lines 46-65)

**Interfaces:**
- Consumes: `clientBaseUrl`, `requestedModel`, `apiKey` (route locals), `createOpenAI` from `@ai-sdk/openai` (already imported), `clientApiKey` from request body.
- Produces: `modelInstance` built as `createOpenAI({ apiKey, baseURL: clientBaseUrl })(requestedModel)` for `provider === 'custom'`; 400 errors `Custom provider requires a Base URL in Settings` / `Custom provider requires a model`; 401 path unchanged for missing key.

- [ ] **Step 1: API key resolution — custom uses client key only**

In the key-resolution block, extend the `else if` chain with custom (no env fallback):

```ts
  let apiKey = clientApiKey
  if (!apiKey) {
    if (provider === 'openai') apiKey = process.env.OPENAI_API_KEY
    else if (provider === 'anthropic') apiKey = process.env.ANTHROPIC_API_KEY
    else if (provider === 'google') apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    else if (provider === 'deepseek') apiKey = process.env.DEEPSEEK_API_KEY
  }
```

No change to this block: for `custom`, `apiKey` stays whatever the client sent; the existing 401 check below it (`No API key provided for custom...`) already produces the right message.

- [ ] **Step 2: Add the custom branch to provider construction**

Insert immediately before the final `} else { // Default OpenAI` block:

```ts
  } else if (provider === 'custom') {
    if (!clientBaseUrl) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Custom provider requires a Base URL in Settings'
      })
    }
    if (!requestedModel) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Custom provider requires a model'
      })
    }
    const custom = createOpenAI({ apiKey, baseURL: clientBaseUrl })
    modelInstance = custom(requestedModel)
  } else {
```

(Leaving the Default OpenAI `else` block exactly as-is.)

- [ ] **Step 3: Typecheck**

Run: `npx vue-tsc --noEmit`
Expected: zero errors.

- [ ] **Step 4: Runtime verification with curl**

With the dev server running (see Task 2 Step 7 startup), from PowerShell:

Missing base URL → expect 400:
```powershell
Invoke-WebRequest -Uri http://localhost:3000/api/chat -Method Post -ContentType 'application/json' -Body ('{"messages":[{"role":"user","content":"hi"}],"provider":"custom","apiKey":"k","model":"m"}') -SkipHttpErrorCheck | Select-Object StatusCode, Content
```
Expected: `StatusCode 400`, content contains `Custom provider requires a Base URL in Settings`.

Missing model → expect 400:
```powershell
Invoke-WebRequest -Uri http://localhost:3000/api/chat -Method Post -ContentType 'application/json' -Body ('{"messages":[{"role":"user","content":"hi"}],"provider":"custom","apiKey":"k","baseUrl":"http://localhost:11434/v1"}') -SkipHttpErrorCheck | Select-Object StatusCode, Content
```
Expected: `StatusCode 400`, content contains `Custom provider requires a model`.

Missing key → expect 401:
```powershell
Invoke-WebRequest -Uri http://localhost:3000/api/chat -Method Post -ContentType 'application/json' -Body ('{"messages":[{"role":"user","content":"hi"}],"provider":"custom","baseUrl":"http://localhost:11434/v1","model":"m"}') -SkipHttpErrorCheck | Select-Object StatusCode, Content
```
Expected: `StatusCode 401`, content contains `No API key provided for custom`.

Passthrough (bogus key against a live endpoint) → expect upstream error shape, NOT a DOMinic 4xx:
```powershell
Invoke-WebRequest -Uri http://localhost:3000/api/chat -Method Post -ContentType 'application/json' -Body ('{"messages":[{"role":"user","content":"hi"}],"provider":"custom","apiKey":"sk-bogus","baseUrl":"https://openrouter.ai/api/v1","model":"openai/gpt-4o-mini"}') -SkipHttpErrorCheck | Select-Object StatusCode, Content
```
Expected: non-400/401 response (AI SDK upstream error flows back through the existing `e:` error path) — proves baseURL wiring reaches the endpoint.

Regression: `provider:"openai"` with no key still returns 401 mentioning openai.

- [ ] **Step 5: Commit**

```powershell
git add server/api/chat.post.ts
git commit -m "feat(chat): support provider 'custom' with client-supplied OpenAI-compatible base URL"
```

---

### Task 4: Final verification + push

**Files:**
- Modify: none (verification only)

**Interfaces:**
- Consumes: all prior tasks.
- Produces: a pushed branch ready for PR.

- [ ] **Step 1: Full typecheck**

Run: `npx vue-tsc --noEmit`
Expected: zero errors.

- [ ] **Step 2: Confirm existing providers untouched**

Run: `git diff origin/main --stat`
Expected: exactly four files changed — `app/features/chat/types/chat.ts`, `app/features/settings/components/SettingsApp.vue`, `app/features/settings/stores/settings.ts`, `server/api/chat.post.ts` (plus this plan/spec docs if included in the branch).

- [ ] **Step 3: Push**

```powershell
git push -u origin feat/custom-openai-provider
```

- [ ] **Step 4: Open PR**

```powershell
$env:Path += ";C:\Program Files\GitHub CLI"
gh pr create --title "feat: custom OpenAI-compatible provider (base URL + model)" --body "Closes the custom-provider gap: fifth Settings provider card 'Custom' for any OpenAI-compatible endpoint (OpenRouter, Ollama, LM Studio, gateways). Requires base URL + model client-side; /api/chat builds createOpenAI({ baseURL: clientBaseUrl }) — client-key only, lenient URL handling. Spec: docs/superpowers/specs/2026-09-12-custom-openai-compatible-provider-design.md"
```
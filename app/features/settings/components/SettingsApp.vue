<template>
  <div class="h-full w-full flex flex-col bg-slate-950 text-slate-100 p-6 overflow-y-auto space-y-6 select-text text-sm">
    <!-- Header -->
    <div class="border-b border-slate-800/80 pb-4">
      <h2 class="text-lg font-semibold text-white">System Settings</h2>
      <p class="text-xs text-slate-400 mt-1">
        Configure your frontier LLM provider credentials and manage OS persistence.
      </p>
    </div>

    <!-- Provider Configuration -->
    <div class="space-y-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
      <h3 class="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
        AI Provider & Credentials
      </h3>

      <!-- Provider Radio Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          v-for="p in providers"
          :key="p.id"
          type="button"
          class="p-2.5 rounded-lg border text-xs font-medium transition flex flex-col items-center space-y-1"
          :class="
            selectedProvider === p.id
              ? 'bg-blue-600/20 border-blue-500 text-blue-300'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
          "
          @click="selectProvider(p.id)"
        >
          <span>{{ p.icon }}</span>
          <span>{{ p.name }}</span>
        </button>
      </div>

      <!-- Model Input -->
      <div class="space-y-1.5">
        <label class="text-xs text-slate-300 font-medium">Model Identifier</label>
        <input
          v-model="modelInput"
          type="text"
          placeholder="e.g. gpt-4o, claude-3-5-sonnet-20241022, gemini-1.5-pro"
          class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
        />
      </div>

      <!-- API Key Input -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <label class="text-xs text-slate-300 font-medium">API Key</label>
          <button
            type="button"
            class="text-[11px] text-slate-500 hover:text-slate-300"
            @click="showKey = !showKey"
          >
            {{ showKey ? 'Hide' : 'Show' }}
          </button>
        </div>
        <input
          v-model="apiKeyInput"
          :type="showKey ? 'text' : 'password'"
          placeholder="Enter provider API key (stored in browser localStorage only)..."
          class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
        />
        <span class="text-[11px] text-slate-500">
          Your key never leaves your browser at rest. It is passed ephemerally per request.
        </span>
      </div>

      <!-- Custom Base URL (Optional) -->
      <div class="space-y-1.5">
        <label class="text-xs text-slate-300 font-medium">Custom Base URL (Optional)</label>
        <input
          v-model="baseUrlInput"
          type="text"
          placeholder="https://api.openai.com/v1 or custom proxy"
          class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
        />
      </div>

      <!-- Save Button -->
      <div class="pt-2 flex items-center space-x-3">
        <button
          type="button"
          class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition shadow-sm"
          @click="save"
        >
          Save Credentials
        </button>

        <span v-if="savedNotice" class="text-xs text-emerald-400 animate-fade-in">
          ✓ Saved to local storage
        </span>
      </div>
    </div>

    <!-- Danger Zone: Reset OS -->
    <div class="space-y-3 bg-rose-950/20 p-4 rounded-xl border border-rose-900/40">
      <h3 class="text-xs font-mono uppercase tracking-wider text-rose-400 font-semibold">
        System Danger Zone
      </h3>
      <p class="text-xs text-rose-200/80">
        Resetting will wipe all installed applications, virtual filesystem files, and credentials from browser storage.
      </p>

      <button
        type="button"
        class="px-3.5 py-2 rounded-lg bg-rose-700 hover:bg-rose-600 text-white text-xs font-medium transition"
        @click="confirmReset"
      >
        Reset Operating System
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSettingsStore, type LlmProvider } from '../stores/settings'

const settingsStore = useSettingsStore()

const providers: { id: LlmProvider; name: string; icon: string; defaultModel: string }[] = [
  { id: 'openai', name: 'OpenAI', icon: '⚡', defaultModel: 'gpt-4o' },
  { id: 'anthropic', name: 'Anthropic', icon: '🧠', defaultModel: 'claude-3-5-sonnet-20241022' },
  { id: 'google', name: 'Google', icon: '✨', defaultModel: 'gemini-1.5-pro' },
  { id: 'deepseek', name: 'DeepSeek', icon: '🐋', defaultModel: 'deepseek-chat' }
]

const selectedProvider = ref<LlmProvider>('openai')
const modelInput = ref('gpt-4o')
const apiKeyInput = ref('')
const baseUrlInput = ref('')
const showKey = ref(false)
const savedNotice = ref(false)

function selectProvider(p: LlmProvider) {
  selectedProvider.value = p
  const preset = providers.find((x) => x.id === p)
  if (preset) {
    modelInput.value = preset.defaultModel
  }
}

function save() {
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

function confirmReset() {
  if (confirm('Are you sure you want to reset DOMinic OS? All apps and settings will be permanently wiped.')) {
    settingsStore.resetOs()
  }
}

onMounted(() => {
  settingsStore.hydrate()
  selectedProvider.value = settingsStore.provider
  modelInput.value = settingsStore.model
  apiKeyInput.value = settingsStore.apiKey
  baseUrlInput.value = settingsStore.baseUrl
})
</script>

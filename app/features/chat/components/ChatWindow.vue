<template>
  <div class="flex flex-col h-full bg-slate-950/90 text-slate-100 font-sans select-text">
    <!-- Sub-header / status bar -->
    <div class="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 bg-slate-900/60 text-xs text-slate-400">
      <div class="flex items-center space-x-2">
        <span class="inline-block w-2 h-2 rounded-full" :class="isStreaming ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'" />
        <span>{{ isStreaming ? 'Synthesizing...' : 'DOMinic Kernel Ready' }}</span>
      </div>
      <div class="flex items-center space-x-3">
        <button
          v-if="messages.length > 1"
          class="hover:text-slate-200 transition"
          title="Clear chat history"
          @click="clearHistory"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- Messages list -->
    <div
      ref="scrollContainer"
      class="flex-1 overflow-y-auto p-4 space-y-4 text-sm"
    >
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="flex flex-col"
        :class="msg.role === 'user' ? 'items-end' : 'items-start'"
      >
        <!-- Role badge -->
        <span class="text-[10px] text-slate-500 mb-1 px-1 font-mono uppercase tracking-wider">
          {{ msg.role === 'user' ? 'You' : 'DOMinic Agent' }}
        </span>

        <!-- Message bubble -->
        <div
          class="max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm text-sm whitespace-pre-wrap leading-relaxed"
          :class="
            msg.role === 'user'
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-sm'
          "
        >
          {{ msg.content }}

          <!-- Tool Invocations Display -->
          <div
            v-if="msg.toolInvocations && msg.toolInvocations.length > 0"
            class="mt-3 space-y-2 pt-2 border-t border-slate-700/50"
          >
            <div
              v-for="tool in msg.toolInvocations"
              :key="tool.toolCallId"
              class="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs"
            >
              <div class="flex items-center space-x-2">
                <span v-if="tool.state === 'call'" class="animate-spin text-blue-400">⚙️</span>
                <span v-else class="text-emerald-400">✅</span>

                <div class="flex flex-col">
                  <span class="font-medium text-slate-200">
                    {{ tool.toolName === 'install_app' ? 'Installing Application' : 'Updating Application' }}
                  </span>
                  <span class="text-[11px] text-slate-400">
                    {{ tool.args?.title || tool.args?.id }}
                  </span>
                </div>
              </div>

              <span
                class="px-2 py-0.5 rounded text-[10px] font-mono uppercase"
                :class="
                  tool.state === 'call'
                    ? 'bg-blue-900/50 text-blue-300 border border-blue-700/50 animate-pulse'
                    : 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/50'
                "
              >
                {{ tool.state === 'call' ? 'Executing' : 'Mounted' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Streaming thinking indicator -->
      <div v-if="isStreaming" class="flex items-center space-x-2 text-xs text-slate-500 italic">
        <span class="inline-block w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style="animation-delay: 0ms" />
        <span class="inline-block w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style="animation-delay: 150ms" />
        <span class="inline-block w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style="animation-delay: 300ms" />
        <span>Authoring code...</span>
      </div>
    </div>

    <!-- Quick Demo Suggestion Chips -->
    <div v-if="messages.length <= 2" class="px-4 pb-2 flex flex-wrap gap-1.5">
      <button
        v-for="suggestion in suggestions"
        :key="suggestion.label"
        class="text-xs px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition hover:border-slate-700"
        @click="sendMessage(suggestion.prompt)"
      >
        {{ suggestion.label }}
      </button>
    </div>

    <!-- Input Footer -->
    <div class="p-3 border-t border-slate-800/80 bg-slate-900/40">
      <form class="flex items-center space-x-2" @submit.prevent="handleSend">
        <input
          v-model="input"
          type="text"
          placeholder="Ask DOMinic to build an app (e.g. 'Build a pomodoro timer')..."
          :disabled="isStreaming"
          class="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
        />

        <button
          type="submit"
          :disabled="isStreaming || !input.trim()"
          class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-medium text-sm transition flex items-center space-x-1 disabled:text-slate-500 disabled:cursor-not-allowed shadow-sm"
        >
          <span>Send</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useAgentChat, type UseAgentChatOptions } from '../composables/useAgentChat'

const props = defineProps<{
  options?: UseAgentChatOptions
}>()

const scrollContainer = ref<HTMLElement | null>(null)

const {
  messages,
  input,
  isStreaming,
  error,
  sendMessage,
  clearHistory
} = useAgentChat(props.options)

const suggestions = [
  {
    label: '⏱️ Pomodoro Timer',
    prompt: 'Build a beautiful retro synthwave Pomodoro focus timer with audio clicks, play/pause, and confetti celebration on finish.'
  },
  {
    label: '📈 Crypto Tracker',
    prompt: 'Build a live cryptocurrency price tracker showing Bitcoin, Ethereum, and Solana with mock or live fetch price cards.'
  },
  {
    label: '📝 Scratchpad',
    prompt: 'Build a sleek markdown scratchpad with persistent notes, character count, and quick export.'
  }
]

function handleSend() {
  if (!input.value.trim()) return
  sendMessage()
}

defineExpose({ sendMessage })

// Auto-scroll on new messages or streaming chunks
watch(
  () => [messages.value.length, messages.value[messages.value.length - 1]?.content],
  async () => {
    await nextTick()
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
    }
  }
)
</script>

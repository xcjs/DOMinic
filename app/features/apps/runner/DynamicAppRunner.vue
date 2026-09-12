<template>
  <div class="h-full w-full flex flex-col relative overflow-hidden bg-slate-950 text-slate-100">
    <!-- Compile / Loading State -->
    <div
      v-if="isLoading"
      class="flex-1 flex flex-col items-center justify-center p-6 space-y-3 text-slate-400"
    >
      <div class="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      <span class="text-xs font-medium">Compiling application component...</span>
    </div>

    <!-- Error State (Compile Error or Runtime Error) -->
    <div
      v-else-if="error"
      class="flex-1 flex flex-col p-6 overflow-y-auto bg-rose-950/20 text-rose-200"
    >
      <div class="flex items-center space-x-2 text-rose-400 mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span class="font-semibold text-sm">Application Runtime Error</span>
      </div>

      <div class="p-3.5 rounded-lg bg-rose-950/60 border border-rose-800/60 text-xs font-mono whitespace-pre-wrap leading-relaxed mb-4 select-text">
        {{ error }}
      </div>

      <div class="flex items-center space-x-3 mt-auto pt-2">
        <button
          class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition flex items-center space-x-1.5 shadow-sm"
          @click="handleAskFix"
        >
          <span>✨</span>
          <span>Ask Agent to Fix</span>
        </button>

        <button
          class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition"
          @click="retryCompile"
        >
          Retry
        </button>
      </div>
    </div>

    <!-- Running Component Mounted -->
    <component
      :is="compiledComponent"
      v-else-if="compiledComponent"
      :app-id="appId"
      :window-id="windowId"
      class="flex-1 w-full h-full overflow-auto"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onErrorCaptured, onMounted, shallowRef } from 'vue'
import { compileVueSfc } from './loader'

const props = defineProps<{
  sourceCode: string
  appId: string
  windowId?: string
}>()

const emit = defineEmits<{
  (e: 'askFix', payload: { appId: string; error: string; sourceCode: string }): void
}>()

const isLoading = ref(true)
const error = ref<string | null>(null)
const compiledComponent = shallowRef<any>(null)

async function loadComponent() {
  if (!props.sourceCode?.trim()) {
    error.value = 'No component source code provided to runner.'
    isLoading.value = false
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const comp = await compileVueSfc({
      sourceCode: props.sourceCode,
      appId: props.appId
    })
    compiledComponent.value = comp
  } catch (err: any) {
    console.error(`[DOMinic Engine] Compilation error in "${props.appId}":`, err)
    error.value = err?.message || String(err)
  } finally {
    isLoading.value = false
  }
}

// Error boundary catching errors in mounted child component
onErrorCaptured((err: Error, _instance, info: string) => {
  console.error(`[DOMinic Engine] Runtime render error in "${props.appId}":`, err, info)
  error.value = `${err.name}: ${err.message}\n${err.stack || ''}\n(Occurred during: ${info})`
  return false // Stop propagation
})

function retryCompile() {
  loadComponent()
}

function handleAskFix() {
  emit('askFix', {
    appId: props.appId,
    error: error.value || 'Unknown runtime error',
    sourceCode: props.sourceCode
  })
}

// Watch for code updates (e.g. from update_app)
watch(
  () => props.sourceCode,
  () => {
    loadComponent()
  }
)

onMounted(() => {
  loadComponent()
})
</script>

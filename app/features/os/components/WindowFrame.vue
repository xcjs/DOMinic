<script setup lang="ts">
import { computed } from 'vue'
import type { WindowInstance } from '../types'

const props = defineProps<{ window: WindowInstance; focused: boolean }>()
const emit = defineEmits<{
  focus: []
  minimize: []
  maximize: []
  close: []
  move: [x: number, y: number]
}>()

const style = computed(() => props.window.maximized
  ? { zIndex: props.window.zIndex }
  : {
      left: `${props.window.x}px`, top: `${props.window.y}px`,
      width: `${props.window.width}px`, height: `${props.window.height}px`,
      zIndex: props.window.zIndex,
    })

let dragOffset: { x: number; y: number } | null = null

function beginDrag(event: PointerEvent) {
  if (props.window.maximized || (event.target as HTMLElement).closest('button')) return
  const frame = (event.currentTarget as HTMLElement | null)?.parentElement
  if (!frame) return
  const bounds = frame.getBoundingClientRect()
  dragOffset = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  emit('focus')
}

function drag(event: PointerEvent) {
  if (!dragOffset) return
  emit('move', event.clientX - dragOffset.x, event.clientY - dragOffset.y)
}

function endDrag() {
  dragOffset = null
}
</script>

<template>
  <section
    class="window-frame"
    :class="{ 'window-frame--maximized': window.maximized, 'window-frame--focused': focused }"
    :style="style"
    @pointerdown="emit('focus')"
  >
    <header class="window-frame__titlebar" @pointerdown="beginDrag" @pointermove="drag" @pointerup="endDrag" @pointercancel="endDrag">
      <span class="window-frame__title"><span aria-hidden="true">{{ window.icon }}</span>{{ window.title }}</span>
      <span class="window-frame__controls">
        <button aria-label="Minimize window" @click.stop="emit('minimize')">—</button>
        <button :aria-label="window.maximized ? 'Restore window' : 'Maximize window'" @click.stop="emit('maximize')">□</button>
        <button aria-label="Close window" class="window-frame__close" @click.stop="emit('close')">×</button>
      </span>
    </header>
    <main class="window-frame__content"><slot /></main>
  </section>
</template>

<style scoped>
.window-frame { position: fixed; display: grid; grid-template-rows: 42px 1fr; overflow: hidden; border: 1px solid rgb(148 163 184 / .36); border-radius: 14px; background: rgb(15 23 42 / .9); box-shadow: 0 24px 70px rgb(2 6 23 / .5); backdrop-filter: blur(18px); }
.window-frame--focused { border-color: rgb(56 189 248 / .78); box-shadow: 0 24px 70px rgb(2 6 23 / .5), 0 0 0 1px rgb(56 189 248 / .2); }
.window-frame--maximized { inset: 12px 12px 76px; width: auto; height: auto; border-radius: 14px; }
.window-frame__titlebar { display: flex; align-items: center; justify-content: space-between; padding-left: 14px; background: rgb(30 41 59 / .8); cursor: grab; user-select: none; touch-action: none; }
.window-frame__titlebar:active { cursor: grabbing; }
.window-frame__title { display: flex; gap: 8px; align-items: center; color: #e2e8f0; font-size: 14px; font-weight: 600; }
.window-frame__controls { display: flex; align-self: stretch; }
.window-frame__controls button { width: 42px; border: 0; color: #cbd5e1; background: transparent; cursor: pointer; font-size: 18px; }
.window-frame__controls button:hover { background: rgb(148 163 184 / .2); color: white; }
.window-frame__controls .window-frame__close:hover { background: #dc2626; }
.window-frame__content { min-height: 0; overflow: auto; color: #e2e8f0; }
@media (max-width: 767px) { .window-frame { inset: 12px 12px 70px !important; width: auto !important; height: auto !important; border-radius: 18px; } }
</style>

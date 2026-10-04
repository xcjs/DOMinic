<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useMediaQuery } from "@vueuse/core";
import { useOsStore, type OsWindow } from "../stores/os";

const props = defineProps<{ win: OsWindow }>();

const store = useOsStore();

// Below the md breakpoint the shell degrades to stacked full-width cards
// (ADR 0004, NEXT.md 3.1): the stored geometry is ignored, so dragging is
// a no-op at phone widths.
const isPhone = useMediaQuery("(max-width: 767px)");

const dragHandle = ref<HTMLElement | null>(null);
const dragging = ref(false);
const el = ref<HTMLElement | null>(null);

// A phone card has no visible neighbors; focusing a window scrolls it into
// view the way raising it does on desktop.
watch(
  () => store.focusedId === props.win.id,
  (focused) => {
    if (isPhone.value && focused) {
      el.value?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  },
);

const style = computed(() => {
  if (props.win.state === "maximized") {
    return {
      left: "0px",
      top: "0px",
      width: "100vw",
      height: "calc(100vh - 48px)",
      zIndex: 50 + props.win.z,
    };
  }
  return {
    left: `${props.win.x}px`,
    top: `${props.win.y}px`,
    width: `${props.win.width}px`,
    height: `${props.win.height}px`,
    zIndex: props.win.z,
  };
});

function clamp(x: number, min: number, max: number): number {
  return Math.min(Math.max(x, min), max);
}

function onPointerDown(event: PointerEvent): void {
  if (props.win.state === "maximized") return;
  if (isPhone.value) return;
  store.focusWindow(props.win.id);
  dragging.value = true;
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
}

function onPointerMove(event: PointerEvent): void {
  if (!dragging.value) return;
  const handle = dragHandle.value;
  if (!handle) return;
  const rect = handle.getBoundingClientRect();
  const nx = clamp(props.win.x + event.movementX, -rect.width + 80, window.innerWidth - 80);
  const ny = clamp(props.win.y + event.movementY, 0, window.innerHeight - 48 - 40);
  store.moveWindow(props.win.id, nx, ny);
}

function onPointerUp(event: PointerEvent): void {
  dragging.value = false;
  (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
}
</script>

<template>
  <section
    ref="el"
    v-show="!win.minimized"
    class="absolute flex flex-col overflow-hidden rounded-lg border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur max-md:!static max-md:!mx-2 max-md:!mb-3 max-md:!mt-4 first:max-md:!mt-0 max-md:!h-[70vh] max-md:!w-auto"
    :class="store.focusedId === win.id ? 'ring-2 ring-indigo-400' : ''"
    :style="style"
    @pointerdown="store.focusWindow(win.id)"
  >
    <header
      ref="dragHandle"
      class="flex h-9 shrink-0 cursor-grab items-center justify-between border-b border-white/10 bg-slate-800/80 px-3 select-none active:cursor-grabbing max-md:cursor-default"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
    >
      <span class="truncate text-xs font-medium text-slate-200">{{ win.title }}</span>
      <span class="flex items-center gap-1" @pointerdown.stop>
        <button
          class="flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-white/10 hover:text-slate-100"
          aria-label="Minimize"
          @pointerdown.stop="store.focusWindow(win.id)"
          @click.stop="store.toggleMinimize(win.id)"
        >
          &minus;
        </button>
        <button
          class="flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-white/10 hover:text-slate-100"
          :aria-label="win.state === 'maximized' ? 'Restore' : 'Maximize'"
          @pointerdown.stop="store.focusWindow(win.id)"
          @click.stop="store.toggleMaximize(win.id)"
        >
          &#9633;
        </button>
        <button
          class="flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-red-500/80 hover:text-white"
          aria-label="Close"
          @pointerdown.stop="store.focusWindow(win.id)"
          @click.stop="store.closeWindow(win.id)"
        >
          &times;
        </button>
      </span>
    </header>
    <div class="flex-1 overflow-auto p-3">
      <slot />
    </div>
  </section>
</template>

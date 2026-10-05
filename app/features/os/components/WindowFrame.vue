<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import { useMediaQuery } from "@vueuse/core";
import { useOsStore, type OsWindow, type SnapZone } from "../stores/os";

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

const snapZone = ref<SnapZone | null>(null);
const armed = ref(false);
const downPoint = ref<{ x: number; y: number } | null>(null);
const TASKBAR = 48;
const EDGE = 24; // px from a viewport edge that activates a snap zone
const TOP = 6; // thin maximize trigger near the screen edge, Windows-style
const ARM = 8; // travel px that arms zones; below it, clicks are jitter

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

function zoneAt(pointerX: number, pointerY: number): SnapZone | null {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const atLeft = pointerX <= EDGE;
  const atRight = pointerX >= vw - EDGE;
  const atTop = pointerY <= TOP;
  const atBottom = pointerY >= vh - TASKBAR - EDGE - 8;
  if (atTop && atLeft) return "tl";
  if (atTop && atRight) return "tr";
  if (atBottom && atLeft) return "bl";
  if (atBottom && atRight) return "br";
  if (atTop) return "max";
  if (atLeft) return "left";
  if (atRight) return "right";
  return null;
}

const zoneRect = computed(() => {
  const zone = snapZone.value;
  if (!zone) return null;
  const vw = window.innerWidth;
  const vh = window.innerHeight - TASKBAR;
  const half = { left: 0, top: 0, width: vw / 2, height: vh };
  const quarterH = vw / 2;
  const quarterV = vh / 2;
  switch (zone) {
    case "left":
      return half;
    case "right":
      return { ...half, left: vw / 2 };
    case "tl":
      return { ...half, width: quarterH, height: quarterV };
    case "tr":
      return { left: vw / 2, top: 0, width: quarterH, height: quarterV };
    case "bl":
      return { left: 0, top: quarterV, width: quarterH, height: quarterV };
    case "br":
      return { left: vw / 2, top: quarterV, width: quarterH, height: quarterV };
    case "max":
      return { left: 0, top: 0, width: vw, height: vh };
  }
  return null;
});

function onPointerDown(event: PointerEvent): void {
  if (props.win.state === "maximized") return;
  if (isPhone.value) return;
  store.focusWindow(props.win.id);
  dragging.value = true;
  armed.value = false;
  downPoint.value = { x: event.clientX, y: event.clientY };
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
}

function onPointerMove(event: PointerEvent): void {
  if (!dragging.value) {
    // A single move while holding the grab affords unsnapping, but the
    // real restore happens on the first move after a snapped state.
    return;
  }
  if (!armed.value) {
    const start = downPoint.value;
    if (!start) return;
    const dx = Math.abs(event.clientX - start.x);
    const dy = Math.abs(event.clientY - start.y);
    if (dx < ARM && dy < ARM) return; // click jitter guard
    armed.value = true;
  }
  if (props.win.preSnap) {
    // Windows-style unsnap (NEXT.md 3.2): restore the saved size, then
    // re-place the window so the pointer keeps its relative spot on the
    // title bar instead of teleporting to the stale pre-snap origin.
    const pre = props.win.preSnap;
    const fracX = clamp((event.clientX - props.win.x) / props.win.width, 0, 1);
    const grabY = clamp(event.clientY - props.win.y, 0, 30); // stays in the 36px header
    store.unsnapWindow(props.win.id);
    store.moveWindow(
      props.win.id,
      event.clientX - clamp(fracX * pre.width, 8, pre.width - 8),
      event.clientY - grabY,
    );
    snapZone.value = zoneAt(event.clientX, event.clientY);
    return;
  }
  const handle = dragHandle.value;
  if (!handle) return;
  const rect = handle.getBoundingClientRect();
  const nx = clamp(props.win.x + event.movementX, -rect.width + 80, window.innerWidth - 80);
  const ny = clamp(props.win.y + event.movementY, 0, window.innerHeight - 48 - 40);
  store.moveWindow(props.win.id, nx, ny);
  snapZone.value = zoneAt(event.clientX, event.clientY);
}

function onPointerUp(event: PointerEvent): void {
  dragging.value = false;
  armed.value = false;
  downPoint.value = null;
  const zone = snapZone.value;
  snapZone.value = null;
  if (zone) {
    store.snapWindow(props.win.id, zone);
  }
  (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
}

onUnmounted(() => {
  dragging.value = false;
  snapZone.value = null;
});

// A dragged pointer leaving the window still updates the zone highlight.
watch(dragging, (active) => {
  if (!active) snapZone.value = null;
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="zoneRect"
      class="pointer-events-none fixed z-[999] rounded-lg border-2 border-indigo-400 bg-indigo-400/15 transition-all duration-100"
      :style="{
        left: `${zoneRect.left}px`,
        top: `${zoneRect.top}px`,
        width: `${zoneRect.width}px`,
        height: `${zoneRect.height}px`,
      }"
      aria-hidden="true"
    />
  </Teleport>
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
      <span
        class="flex items-center gap-1"
        @pointerdown.stop
      >
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

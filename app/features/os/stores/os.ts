import { defineStore } from "pinia";
import { computed, ref } from "vue";

export type WindowState = "normal" | "minimized" | "maximized";

export interface OsWindow {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  state: WindowState;
  minimized: boolean;
}

let nextId = 1;

export const useOsStore = defineStore("os", () => {
  const windows = ref<OsWindow[]>([]);
  const focusedId = ref<string | null>(null);
  const topZ = computed(() =>
    windows.value.reduce((max, w) => Math.max(max, w.z), 0),
  );

  function openWindow(init: Partial<OsWindow> & { title: string }): OsWindow {
    const id = `win-${nextId++}`;
    const offset = (windows.value.length % 6) * 28;
    const win: OsWindow = {
      id,
      title: init.title,
      x: init.x ?? 120 + offset,
      y: init.y ?? 90 + offset,
      width: init.width ?? 520,
      height: init.height ?? 360,
      z: topZ.value + 1,
      state: init.state ?? "normal",
      minimized: false,
    };
    windows.value.push(win);
    focusedId.value = id;
    return win;
  }

  function closeWindow(id: string): void {
    windows.value = windows.value.filter((w) => w.id !== id);
    if (focusedId.value === id) {
      const visible = windows.value.filter((w) => !w.minimized);
      const top = visible.reduce<OsWindow | null>(
        (best, w) => (!best || w.z > best.z ? w : best),
        null,
      );
      focusedId.value = top?.id ?? null;
    }
  }

  function focusWindow(id: string): void {
    const win = windows.value.find((w) => w.id === id);
    if (!win) return;
    win.z = topZ.value + 1;
    if (win.minimized) win.minimized = false;
    focusedId.value = id;
  }

  function moveWindow(id: string, x: number, y: number): void {
    const win = windows.value.find((w) => w.id === id);
    if (!win) return;
    win.x = x;
    win.y = y;
  }

  function toggleMaximize(id: string): void {
    const win = windows.value.find((w) => w.id === id);
    if (!win) return;
    win.state = win.state === "maximized" ? "normal" : "maximized";
    win.minimized = false;
    focusWindow(id);
  }

  function toggleMinimize(id: string): void {
    const win = windows.value.find((w) => w.id === id);
    if (!win) return;
    win.minimized = !win.minimized;
    if (win.minimized && focusedId.value === id) focusedId.value = null;
    if (!win.minimized) focusWindow(id);
  }

  return {
    windows,
    focusedId,
    openWindow,
    closeWindow,
    focusWindow,
    moveWindow,
    toggleMaximize,
    toggleMinimize,
  };
});
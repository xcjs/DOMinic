import { defineStore } from "pinia";
import { computed, ref } from "vue";

export type WindowState = "normal" | "minimized" | "maximized";

export type SnapZone = "left" | "right" | "max" | "tl" | "tr" | "bl" | "br";

export interface OsWindow {
  id: string;
  appId?: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  state: WindowState;
  minimized: boolean;
  // Geometry to restore when a snapped window is dragged away (NEXT.md 3.2).
  preSnap?: { x: number; y: number; width: number; height: number } | null;
  // Multi-desktop workspaces (NEXT.md 3.2b): window lives on exactly one.
  workspace: number;
}

let nextId = 1;

export const useOsStore = defineStore("os", () => {
  const windows = ref<OsWindow[]>([]);
  const focusedId = ref<string | null>(null);
  const activeWorkspace = ref(0);
  const workspaceCount = ref(1);
  const topZ = computed(() =>
    windows.value.reduce((max, w) => Math.max(max, w.z), 0),
  );
  // Windows on other desktops stay mounted but hidden by WindowFrame's
  // v-show (their component state — chat drafts, running apps — must
  // survive a desktop switch; NEXT.md 3.2b).
  const visibleWindows = computed(() =>
    windows.value.filter((w) => w.workspace === activeWorkspace.value),
  );

  function openWindow(init: Partial<OsWindow> & { title: string }): OsWindow {
    const id = `win-${nextId++}`;
    const offset = (windows.value.length % 6) * 28;
    const win: OsWindow = {
      id,
      appId: init.appId,
      title: init.title,
      x: init.x ?? 120 + offset,
      y: init.y ?? 90 + offset,
      width: init.width ?? 520,
      height: init.height ?? 360,
      z: topZ.value + 1,
      state: init.state ?? "normal",
      minimized: false,
      workspace: activeWorkspace.value,
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

  function setWindowRect(
    id: string,
    rect: { x: number; y: number; width: number; height: number },
  ): void {
    const win = windows.value.find((w) => w.id === id);
    if (!win) return;
    win.x = rect.x;
    win.y = rect.y;
    win.width = rect.width;
    win.height = rect.height;
    win.state = "normal";
    win.minimized = false;
  }

  // Aero-style snap (NEXT.md 3.2): the original rect is remembered so a
  // later drag away from the snapped position restores it.
  function snapWindow(id: string, zone: SnapZone): void {
    const win = windows.value.find((w) => w.id === id);
    if (!win) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight - 48; // taskbar height
    const gap = 8;
    const half = {
      x: zone === "right" ? vw / 2 : 0,
      y: 0,
      width: vw / 2,
      height: vh,
    };
    const quarter = {
      x: zone === "tr" || zone === "br" ? vw / 2 : 0,
      y: zone === "bl" || zone === "br" ? vh / 2 : 0,
      width: vw / 2,
      height: vh / 2,
    };
    const snapped = zone === "max" ? null : zone === "left" || zone === "right" ? half : quarter;
    if (zone === "max") {
      if (win.state !== "maximized") win.preSnap = { x: win.x, y: win.y, width: win.width, height: win.height };
      win.state = "maximized";
    } else if (snapped) {
      if (!win.preSnap) {
        win.preSnap = {
          x: win.state === "maximized" ? (window.innerWidth - win.width) / 2 : win.x,
          y: win.state === "maximized" ? 0 : win.y,
          width: win.width,
          height: win.state === "maximized" ? vh : win.height,
        };
      }
      setWindowRect(id, { ...snapped, y: snapped.y + gap / 2, height: snapped.height - gap });
    }
    focusWindow(id);
  }

  // Dragging a snapped window away from its zone restores the stored rect.
  function unsnapWindow(id: string): void {
    const win = windows.value.find((w) => w.id === id);
    if (!win || !win.preSnap) return;
    const pre = win.preSnap;
    win.preSnap = null;
    setWindowRect(id, pre);
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

  // Switching desktops keeps focused windows on their own desktop; a focus
  // is only kept when it is visible on the one becoming active.
  function setWorkspace(index: number): void {
    const target = Math.min(Math.max(index, 0), workspaceCount.value - 1);
    activeWorkspace.value = target;
    const focused = windows.value.find((w) => w.id === focusedId.value);
    if (focused && focused.workspace !== target) {
      const visible = windows.value.filter(
        (w) => w.workspace === target && !w.minimized,
      );
      const top = visible.reduce<OsWindow | null>(
        (best, w) => (!best || w.z > best.z ? w : best),
        null,
      );
      focusedId.value = top?.id ?? null;
    }
  }

  // Workspaces grow on demand; switching to an empty desktop is allowed.
  function createWorkspace(): void {
    workspaceCount.value += 1;
    setWorkspace(workspaceCount.value - 1);
  }

  return {
    windows,
    focusedId,
    activeWorkspace,
    workspaceCount,
    visibleWindows,
    openWindow,
    closeWindow,
    focusWindow,
    moveWindow,
    setWindowRect,
    snapWindow,
    unsnapWindow,
    toggleMaximize,
    toggleMinimize,
    setWorkspace,
    createWorkspace,
  };
});

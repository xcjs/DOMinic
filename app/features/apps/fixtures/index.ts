import pomodoroManifest from './pomodoro-timer/manifest.json'
import pomodoroSource from './pomodoro-timer/index.vue.txt?raw'
import { registerApp } from '../registry'
import { writeFile } from '../../shared/vfs'

export interface AppFixture {
  manifest: {
    id: string
    title: string
    icon: string
    description: string
    author: string
  }
  source: string
}

export const FIXTURES: Record<string, AppFixture> = {
  'pomodoro-timer': {
    manifest: pomodoroManifest,
    source: pomodoroSource
  }
}

/**
 * Install a pre-bundled fixture directly into VFS and app registry.
 */
export function installFixture(fixtureId: string): boolean {
  const fixture = FIXTURES[fixtureId]
  if (!fixture) return false

  const entry = `apps/${fixture.manifest.id}/index.vue`
  writeFile(entry, fixture.source)
  registerApp({
    id: fixture.manifest.id,
    title: fixture.manifest.title,
    icon: fixture.manifest.icon,
    description: fixture.manifest.description,
    entry
  })
  return true
}

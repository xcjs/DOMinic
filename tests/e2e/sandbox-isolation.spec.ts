import { expect, test, type Page } from '@playwright/test'
import { dominicHooks, keepRequestsLocal, openDesktop } from './support/desktop'

// NEXT.md Phase 1 exit: "an app that reaches for `parent.document` or the
// host's `localStorage` fails". A probe app tries both on mount and reports
// what it got to `/__probe`. The test reads those reports at the network
// layer, which also sees requests from iframes, so it doesn't depend on how
// the sandboxed runner (1.2) mounts apps.
//
// Until 1.2 lands, apps share the shell's origin and the probe succeeds, so
// the isolation test is marked `test.fail()`: CI stays green while the gap
// is open. Once 1.2 closes it, Playwright reports that test as passing
// unexpectedly; remove the annotation then. The control test keeps that
// honest: if the probe stops running, the control fails instead of the
// isolation test passing for the wrong reason.

const SETTINGS_KEY = 'dominic:vfs:system/settings.json'
const PLANTED_KEY = 'e2e-planted-key-isolation-probe'

const PROBE_APP = `<template>
  <div class="p-6">
    <h2>Isolation probe</h2>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const report = { settings: '', parentTitle: '' }
  try {
    report.settings = window.localStorage.getItem('${SETTINGS_KEY}') || ''
  } catch (err) {
    report.settings = 'blocked'
  }
  try {
    report.parentTitle = String(window.parent.document.title)
  } catch (err) {
    report.parentTitle = 'blocked'
  }
  fetch('/__probe?d=' + encodeURIComponent(JSON.stringify(report))).catch(() => {})
})
</script>
`

interface ProbeReport {
  settings: string
  parentTitle: string
}

/**
 * Plant a fake provider key where Settings keeps it, open the desktop,
 * install and open the probe app, and return its first report.
 */
async function runProbe(page: Page): Promise<ProbeReport> {
  await page.addInitScript(
    ([key, apiKey]) => {
      if (window !== window.top) return
      try {
        window.localStorage.setItem(
          key,
          JSON.stringify({ provider: 'openai', model: 'gpt-4o', apiKey, baseUrl: '' }),
        )
      } catch {
        // Storage unavailable; the probe then has nothing to find.
      }
    },
    [SETTINGS_KEY, PLANTED_KEY] as const,
  )

  const reports: ProbeReport[] = []
  await page.route('**/__probe?**', async (route) => {
    const data = new URL(route.request().url()).searchParams.get('d') ?? '{}'
    reports.push(JSON.parse(data) as ProbeReport)
    await route.fulfill({ status: 204 })
  })

  await openDesktop(page)
  const dominic = dominicHooks(page)
  await dominic.installApp({
    id: 'isolation-probe',
    title: 'Isolation Probe',
    icon: 'Sparkles',
    description: 'Tries to read the host from inside an app',
    vueSfcCode: PROBE_APP,
  })
  await dominic.openApp('isolation-probe')

  await expect.poll(() => reports.length).toBeGreaterThan(0)
  return reports[0]!
}

test.beforeEach(async ({ page, baseURL }) => {
  await keepRequestsLocal(page, baseURL)
})

test('control: the isolation probe runs and reports', async ({ page }) => {
  const report = await runProbe(page)
  expect(typeof report.settings).toBe('string')
  expect(typeof report.parentTitle).toBe('string')
})

test('an app cannot read the host localStorage or parent.document', async ({ page }) => {
  // Expected to fail until the sandboxed runner (NEXT.md 1.2) lands.
  test.fail()
  const report = await runProbe(page)
  expect.soft(report.settings).not.toContain(PLANTED_KEY)
  expect.soft(report.parentTitle).toBe('blocked')
})

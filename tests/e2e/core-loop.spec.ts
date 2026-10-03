import { expect, test, type Locator, type Page } from '@playwright/test'
import { stubAgentReply } from './support/agent-stub'
import {
  appWindow,
  dominicHooks,
  keepRequestsLocal,
  openDesktop,
  waitForDesktop,
} from './support/desktop'

// The core loop (NEXT.md step 0.1): installFixture -> reload -> updateApp ->
// injectBrokenApp -> Ask Agent to Fix. The agent is stubbed at the network
// layer, so no provider or API key is needed.

const UPDATED_POMODORO = `<template>
  <div class="p-6">
    <h2>Pomodoro Timer, updated</h2>
    <p>Breaks are now ten minutes.</p>
  </div>
</template>
`

// The fix the stubbed agent sends back. The heading text comes from the
// script, so seeing it means the template and the script both compiled and ran.
const REPAIRED_APP = `<template>
  <div class="p-6">
    <h2>{{ status }}</h2>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const status = ref('Repaired by the agent')
</script>
`

test.beforeEach(async ({ page, baseURL }) => {
  await keepRequestsLocal(page, baseURL)
})

/**
 * Click "Ask Agent to Fix" with the agent stubbed to answer with an
 * `update_app` call, and expect the broken window to recover in place.
 */
async function askAgentToFix(page: Page, brokenWindow: Locator, expectInRequest: string[]) {
  const requests = await stubAgentReply(page, {
    text: 'Found the bug; sending a fixed version.',
    updateApp: { id: 'broken-app', vueSfcCode: REPAIRED_APP, summary: 'Fix the deliberate error' },
  })

  await brokenWindow.getByRole('button', { name: 'Ask Agent to Fix' }).click()

  await expect(brokenWindow.getByRole('heading', { name: 'Repaired by the agent' })).toBeVisible()
  await expect(brokenWindow.getByRole('button', { name: 'Ask Agent to Fix' })).toHaveCount(0)
  await expect(
    appWindow(page, 'Agent Chat').getByText('Found the bug; sending a fixed version.'),
  ).toBeVisible()

  // One request, carrying what the agent needs: the app id, the error, and
  // the app's current source.
  expect(requests).toHaveLength(1)
  const fixRequest = requests[0]!.messages.at(-1)!
  expect(fixRequest.role).toBe('user')
  for (const text of expectInRequest) {
    expect(fixRequest.content).toContain(text)
  }
}

test('core loop: install, reload, update, break, ask the agent to fix', async ({ page }) => {
  const dominic = dominicHooks(page)
  const pomodoro = appWindow(page, 'Pomodoro Timer')
  const broken = appWindow(page, 'Broken (Syntax Error)')
  await openDesktop(page)

  await test.step('installFixture installs the app and it renders', async () => {
    expect(await dominic.installFixture('pomodoro-timer')).toBe(true)
    await expect(pomodoro.getByText('25:00')).toBeVisible()
  })

  await test.step('after a reload the app is still installed', async () => {
    await page.reload()
    await waitForDesktop(page)
    await page.getByRole('button', { name: 'Open Pomodoro Timer' }).click()
    await expect(pomodoro.getByText('25:00')).toBeVisible()
  })

  await test.step('updateApp changes the running app in place', async () => {
    await dominic.updateApp({
      id: 'pomodoro-timer',
      vueSfcCode: UPDATED_POMODORO,
      summary: 'Ten-minute breaks',
    })
    await expect(pomodoro.getByText('Breaks are now ten minutes.')).toBeVisible()
    await expect(pomodoro.getByText('25:00')).toHaveCount(0)
  })

  await test.step('injectBrokenApp shows the error card', async () => {
    await dominic.injectBrokenApp('compile')
    await expect(broken.getByText('Component Compilation Error')).toBeVisible()
    await expect(broken.getByRole('button', { name: 'Ask Agent to Fix' })).toBeVisible()
  })

  await test.step('Ask Agent to Fix repairs the app through update_app', async () => {
    await askAgentToFix(page, broken, ['broken-app', 'Syntax Error Component', 'Unexpected token'])
  })
})

test('a runtime crash is caught and repaired the same way', async ({ page }) => {
  const dominic = dominicHooks(page)
  const broken = appWindow(page, 'Broken (Runtime Crash)')
  await openDesktop(page)

  await dominic.injectBrokenApp('runtime')
  await expect(broken.getByText('Application Runtime Error')).toBeVisible()

  await askAgentToFix(page, broken, [
    'broken-app',
    'Runtime Crash Component',
    'Simulated runtime exception inside onMounted()',
  ])
})

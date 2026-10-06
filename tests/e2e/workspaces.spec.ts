import { expect, test } from '@playwright/test'
import {
  appWindow,
  dominicHooks,
  keepRequestsLocal,
  openDesktop,
  shownWindow,
} from './support/desktop'
import { stubAgentReply } from './support/agent-stub'

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

// NEXT.md step 3.2b: workspaces are multiple virtual desktops switchable
// from the taskbar. Windows persist on the desktop they were opened on;
// switching hides the old desktop's windows (they stay mounted) and shows
// the new one's.

test.beforeEach(async ({ page, baseURL }) => {
  await keepRequestsLocal(page, baseURL)
})

test('taskbar workspaces: switch, isolate windows, add a desktop', async ({ page }) => {
  await openDesktop(page)

  await test.step('the taskbar starts with a single workspace', async () => {
    await expect(page.getByRole('tab', { name: 'Workspace 1' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Workspace 2' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Add workspace' })).toBeVisible()
  })

  await test.step('windows opened on desktop 1 stay on desktop 1', async () => {
    // Settings opens from the System panel (top right), not the taskbar.
    await page.getByRole('button', { name: 'Settings' }).click()
    const settings = shownWindow(page, 'Settings')
    await expect(settings).toBeVisible()
  })

  await test.step('adding a workspace switches to an empty desktop 2', async () => {
    await page.getByRole('button', { name: 'Add workspace' }).click()
    await expect(page.getByRole('tab', { name: 'Workspace 2' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    // Windows stay mounted (contents survive switches), just hidden.
    await expect(appWindow(page, 'Settings')).toBeHidden()
  })

  await test.step('switching back to desktop 1 restores its windows', async () => {
    await page.getByRole('tab', { name: 'Workspace 1' }).click()
    await expect(page.getByRole('tab', { name: 'Workspace 1' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(shownWindow(page, 'Settings')).toBeVisible()
  })

  await test.step('windows opened on desktop 2 appear only there', async () => {
    await page.getByRole('tab', { name: 'Workspace 2' }).click()
    await page.getByRole('button', { name: 'Settings' }).click()
    const settings2 = shownWindow(page, 'Settings')
    await expect(settings2).toBeVisible()
    await expect(shownWindow(page, 'Settings')).toHaveCount(1)

    await page.getByRole('tab', { name: 'Workspace 1' }).click()
    await expect(shownWindow(page, 'Settings')).toBeVisible()
    await expect(shownWindow(page, 'Settings')).toHaveCount(1)

    await page.getByRole('tab', { name: 'Workspace 2' }).click()
    await expect(settings2).toBeVisible()
  })
})

test('window contents survive a desktop switch and Ask Agent to Fix follows the chat', async ({ page }) => {
  const chat = appWindow(page, 'Agent Chat')
  await openDesktop(page)

  await test.step('a draft typed into Agent Chat survives switching away and back', async () => {
    const input = chat.getByPlaceholder(/Ask DOMinic to build/)
    await input.fill('please remember this draft')
    await page.getByRole('button', { name: 'Add workspace' }).click()
    await page.getByRole('tab', { name: 'Workspace 1' }).click()
    await expect(input).toHaveValue('please remember this draft')
  })

  await test.step('Ask Agent to Fix switches to the chat desktop and reaches the agent', async () => {
    const dominic = dominicHooks(page)
    // Broken app opens on desktop 2, while the chat lives on desktop 1.
    await page.getByRole('tab', { name: 'Workspace 2' }).click()
    await dominic.injectBrokenApp('compile')
    const broken = appWindow(page, 'Broken (Syntax Error)')
    await expect(broken.getByText('Component Compilation Error')).toBeVisible()

    const requests = await stubAgentReply(page, {
      text: 'Found the bug; sending a fixed version.',
      updateApp: { id: 'broken-app', vueSfcCode: REPAIRED_APP, summary: 'Fix the deliberate error' },
    })
    await broken.getByRole('button', { name: 'Ask Agent to Fix' }).click()

    await expect(page.getByRole('tab', { name: 'Workspace 1' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(chat).toBeVisible()
    expect(requests).toHaveLength(1)
    // The broken app stays mounted on desktop 2; its repaired state is
    // visible after switching back there.
    await expect(broken).toBeHidden()
    await page.getByRole('tab', { name: 'Workspace 2' }).click()
    await expect(broken.getByRole('heading', { name: 'Repaired by the agent' })).toBeVisible()
  })
})
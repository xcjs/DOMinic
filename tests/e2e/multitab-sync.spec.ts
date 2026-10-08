import { expect, test } from '@playwright/test'
import {
  dominicHooks,
  keepRequestsLocal,
  openDesktop,
} from './support/desktop'

// NEXT.md step 3.5 (ADR 0016): tabs of one installation sync the
// installed-apps registry over a BroadcastChannel. Installing in one tab
// makes the app appear in the other tab's taskbar without a reload, and
// uninstalling removes it there too. App source rides the shared
// localStorage VFS, so the synced tab can open the app right away.

test.beforeEach(async ({ page, baseURL }) => {
  await keepRequestsLocal(page, baseURL)
})

test('an install in one tab appears in another tab without a reload', async ({ browser }) => {
  const context = await browser.newContext()
  const pageA = await context.newPage()
  await openDesktop(pageA)

  // Page B mounts after A so it hydrates the pre-sync registry first and
  // must learn about the install through the channel, not localStorage.
  const pageB = await context.newPage()
  await openDesktop(pageB)
  await expect(pageB.getByRole('button', { name: 'Open Pomodoro Timer' })).toHaveCount(0)

  await dominicHooks(pageA).installFixture('pomodoro-timer')

  await expect(
    pageB.getByRole('button', { name: 'Open Pomodoro Timer' }),
  ).toBeVisible({ timeout: 10_000 })

  // The synced tab can actually run the app: source comes from the
  // shared VFS, so opening it mounts the runner with the fixture UI.
  await pageB.getByRole('button', { name: 'Open Pomodoro Timer' }).click()
  await expect(pageB.locator('section').filter({ has: pageB.locator('header').getByText('Pomodoro Timer', { exact: true }) }).filter({ visible: true })).toBeVisible()

  await context.close()
})

test('an uninstall in one tab is removed in the other without a reload', async ({ browser }) => {
  const context = await browser.newContext()
  const pageA = await context.newPage()
  await openDesktop(pageA)
  await dominicHooks(pageA).installFixture('pomodoro-timer')

  const pageB = await context.newPage()
  await openDesktop(pageB)
  await expect(pageB.getByRole('button', { name: 'Open Pomodoro Timer' })).toBeVisible()

  // window.confirm gates the uninstall; Playwright auto-dismisses dialogs,
  // so the test must accept it first.
  pageA.once('dialog', (dialog) => dialog.accept())
  await pageA.getByRole('button', { name: 'Uninstall Pomodoro Timer' }).click()

  await expect(pageB.getByRole('button', { name: 'Open Pomodoro Timer' })).toBeHidden({ timeout: 10_000 })

  await context.close()
})
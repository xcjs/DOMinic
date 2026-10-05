import { expect, test } from '@playwright/test'
import {
  appWindow,
  keepRequestsLocal,
  openDesktop,
} from './support/desktop'

// NEXT.md step 3.2b: workspaces are multiple virtual desktops switchable
// from the taskbar. Windows persist on the desktop they were opened on;
// switching hides the old desktop's windows and shows the new one's.

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
    const settings = appWindow(page, 'Settings')
    await expect(settings).toBeVisible()
  })

  await test.step('adding a workspace switches to an empty desktop 2', async () => {
    await page.getByRole('button', { name: 'Add workspace' }).click()
    await expect(page.getByRole('tab', { name: 'Workspace 2' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(appWindow(page, 'Settings')).toHaveCount(0)
  })

  await test.step('switching back to desktop 1 restores its windows', async () => {
    await page.getByRole('tab', { name: 'Workspace 1' }).click()
    await expect(page.getByRole('tab', { name: 'Workspace 1' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(appWindow(page, 'Settings')).toBeVisible()
  })

  await test.step('windows opened on desktop 2 appear only there', async () => {
    await page.getByRole('tab', { name: 'Workspace 2' }).click()
    await page.getByRole('button', { name: 'Settings' }).click()
    const settings2 = appWindow(page, 'Settings')
    await expect(settings2).toBeVisible()

    await page.getByRole('tab', { name: 'Workspace 1' }).click()
    await expect(appWindow(page, 'Settings')).toBeVisible()

    await page.getByRole('tab', { name: 'Workspace 2' }).click()
    await expect(settings2).toBeVisible()
  })
})
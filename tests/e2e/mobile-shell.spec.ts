import { expect, test } from '@playwright/test'
import {
  appWindow,
  dominicHooks,
  keepRequestsLocal,
  openDesktop,
  waitForDesktop,
} from './support/desktop'

// NEXT.md step 3.1: below 768px the shell degrades to stacked full-width
// cards, dragging is disabled, and the taskbar becomes a touch-sized
// bottom sheet. Every assertion here runs at a phone viewport.

test.use({ viewport: { width: 390, height: 844 } })

test.beforeEach(async ({ page, baseURL }) => {
  await keepRequestsLocal(page, baseURL)
})

test('phone viewport: cards stack, drag is off, the taskbar sheet works', async ({ page }) => {
  const dominic = dominicHooks(page)
  await openDesktop(page)

  await test.step('the installed app renders as a stacked card', async () => {
    expect(await dominic.installFixture('pomodoro-timer')).toBe(true)
    const pomodoro = appWindow(page, 'Pomodoro Timer')
    await expect(pomodoro.getByText('25:00')).toBeVisible()

    const card = await pomodoro.boundingBox()
    expect(card).toBeTruthy()
    expect(card!.width).toBeGreaterThan(340) // full width minus insets
    expect(card!.width).toBeLessThanOrEqual(390)
  })

  await test.step('dragging the title bar does not move the card', async () => {
    const pomodoro = appWindow(page, 'Pomodoro Timer')
    const before = await pomodoro.boundingBox()

    const handle = pomodoro.locator('header')
    const box = await handle.boundingBox()
    expect(box).toBeTruthy()
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
    await page.mouse.down()
    await page.mouse.move(box!.x + 120, box!.y + 80, { steps: 4 })
    await page.mouse.up()

    const after = await pomodoro.boundingBox()
    expect(after!.x).toBeCloseTo(before!.x, 1)
    expect(after!.y).toBeCloseTo(before!.y, 1)
  })

  await test.step('the agent chat stacks as its own card (insertion order)', async () => {
    const chat = appWindow(page, 'Agent Chat')
    await expect(
      chat.getByPlaceholder("Ask DOMinic to build an app"),
    ).toBeVisible()
    const chatBox = await chat.boundingBox()
    const pomodoroBox = await appWindow(page, 'Pomodoro Timer').boundingBox()
    expect(chatBox).toBeTruthy()
    expect(pomodoroBox).toBeTruthy()
    // Chat mounted first, so it is the top card; cards never overlap.
    expect(chatBox!.y + chatBox!.height).toBeLessThanOrEqual(pomodoroBox!.y)
  })

  await test.step('the sheet stays pinned to the viewport bottom while cards scroll', async () => {
    await page.locator('footer').evaluate((f) => {
      const root = f.closest('.h-screen') as HTMLElement
      root.scrollTop = root.scrollHeight
    })
    const sheet = await page.locator('footer').boundingBox()
    expect(sheet!.y + sheet!.height).toBeCloseTo(844, 0)
  })

  await test.step('the focused card scrolls into view above the sheet', async () => {
    // Pomodoro was already focused since install; move focus away and back.
    await page.locator('footer button').filter({ hasText: 'Agent Chat' }).click()
    await page.getByRole('button', { name: 'Open Pomodoro Timer' }).click()
    await expect
      .poll(async () => (await appWindow(page, 'Pomodoro Timer').boundingBox())!.y)
      .toBeLessThanOrEqual(300)
  })

  await test.step('the taskbar sheet has touch-sized controls', async () => {
    const sheet = page.locator('footer')
    await expect(sheet).toBeVisible()
    const box = await sheet.boundingBox()
    expect(box).toBeTruthy()
    expect(box!.height).toBeGreaterThanOrEqual(52) // h-14 = 56px, allow scroll rounding
    // Viewport-relative: pinned by max-md:fixed, bottom edge sits at 844.
    expect(box!.width).toBeGreaterThan(380)
    // h-11 targets 44px touch targets on the sheet's own controls.
    const buttons = sheet.locator('button')
    const count = await buttons.count()
    expect(count).toBeGreaterThan(0)
    for (let i = 0; i < count; i++) {
      const bb = await buttons.nth(i).boundingBox()
      expect(bb!.height).toBeGreaterThanOrEqual(38)
    }
  })

  await test.step('tapping the window button minimizes and restores', async () => {
    // Exact match: the launcher button also contains the title but with an
    // icon span and status dot around it.
    const winButton = page
      .locator('footer button')
      .filter({ hasText: /^Pomodoro Timer$/ })
    await winButton.click()
    await expect(appWindow(page, 'Pomodoro Timer')).toBeHidden()
    await winButton.click()
    await expect(appWindow(page, 'Pomodoro Timer')).toBeVisible()
  })

  await test.step('the fixture persists across reload in card mode', async () => {
    await page.reload()
    await waitForDesktop(page)
    await page.getByRole('button', { name: 'Open Pomodoro Timer' }).click()
    await expect(appWindow(page, 'Pomodoro Timer').getByText('25:00')).toBeVisible()
  })
})
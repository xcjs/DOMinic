import { expect, test, type Page } from '@playwright/test'
import { openDesktop } from './support/desktop'

// NEXT.md step 3.2: Aero-style snap zones while dragging a window - the
// left/right edges tile halves, the top edge maximizes, and corners tile
// quarters. Dragging a snapped window away restores its previous geometry.

test.use({ viewport: { width: 1280, height: 800 } })

/** Drag the chat window's title bar to an absolute viewport point. */
async function dragTitleTo(page: Page, targetX: number, targetY: number): Promise<void> {
  const handle = page
    .locator('section')
    .filter({ has: page.locator('header').getByText('Agent Chat', { exact: true }) })
    .locator('header')
  const box = await handle.boundingBox()
  expect(box).toBeTruthy()
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
  await page.mouse.down()
  await page.mouse.move(targetX, targetY, { steps: 6 })
  await page.mouse.up()
}

test('drag to edges snaps halves, corners, top; drag away restores', async ({ page }) => {
  await openDesktop(page)
  const taskbarHeight = 48
  const vh = 800 - taskbarHeight
  const vw = 1280

  await test.step('drag to the left edge snaps the left half', async () => {
    await dragTitleTo(page, 4, 400)
    const win = page
      .locator('section')
      .filter({ has: page.locator('header').getByText('Agent Chat', { exact: true }) })
    const box = await win.boundingBox()
    expect(box).toBeTruthy()
    expect(box!.x).toBe(0)
    expect(box!.width).toBe(vw / 2)
    expect(box!.height).toBe(vh - 8)
  })

  await test.step('drag the snapped window away restores its old rect', async () => {
    const win = page
      .locator('section')
      .filter({ has: page.locator('header').getByText('Agent Chat', { exact: true }) })
    const restored = { x: 120, y: 90, width: 520, height: 560 } // openWindow defaults
    const before = await win.boundingBox()
    expect(before!.x).toBe(0) // still snapped

    const handle = win.locator('header')
    const box = await handle.boundingBox()
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
    await page.mouse.down()
    await page.mouse.move(box!.x + box!.width / 2 + 200, box!.y + 200, { steps: 6 })
    await page.mouse.up()

    const after = await win.boundingBox()
    expect(after, `after=${JSON.stringify(after)} before=${JSON.stringify(before)}`).toBeTruthy()
    // The pre-snap geometry (the rect the window had mid-drag when the
    // zone fired) comes back: full original size, no longer at x=0.
    expect(after!.width).toBe(restored.width)
    expect(after!.height).toBe(restored.height)
    expect(after!.x).not.toBe(0)
  })

  await test.step('drag to the top-left corner snaps a quarter', async () => {
    await dragTitleTo(page, 4, 4)
    const win = page
      .locator('section')
      .filter({ has: page.locator('header').getByText('Agent Chat', { exact: true }) })
    const box = await win.boundingBox()
    expect(box).toBeTruthy()
    expect(box!.x).toBe(0)
    expect(box!.y).toBe(4) // quarter.y + gap/2
    expect(box!.width).toBe(vw / 2)
    expect(box!.height).toBeCloseTo(vh / 2 - 8, 0)
  })

  await test.step('drag to the top edge maximizes', async () => {
    await dragTitleTo(page, vw / 2, 4)
    const win = page
      .locator('section')
      .filter({ has: page.locator('header').getByText('Agent Chat', { exact: true }) })
    const box = await win.boundingBox()
    expect(box).toBeTruthy()
    expect(box!.width).toBe(vw)
    expect(box!.height).toBe(vh)
  })
})

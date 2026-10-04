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
    // Track where the pointer ends up: 200px right and down from the grab.
    const px = box!.x + box!.width / 2 + 200
    const py = box!.y + box!.height / 2 + 200
    await page.mouse.move(px, py, { steps: 6 })
    await page.mouse.up()

    const after = await win.boundingBox()
    expect(after, `after=${JSON.stringify(after)} before=${JSON.stringify(before)}`).toBeTruthy()
    // The pre-snap geometry comes back: full original size, no longer at
    // x=0, and the title bar stays under the pointer (review guard).
    expect(after!.width).toBe(restored.width)
    expect(after!.height).toBe(restored.height)
    expect(after!.x).not.toBe(0)
    const header = await handle.boundingBox()
    expect(header!.x).toBeLessThanOrEqual(px)
    expect(header!.x + header!.width).toBeGreaterThanOrEqual(px)
    expect(header!.y).toBeLessThanOrEqual(py)
    expect(header!.y + header!.height).toBeGreaterThanOrEqual(py)
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

test('snapped windows ignore in-band grabs and jitter', async ({ page }) => {
  await openDesktop(page)
  await dragTitleTo(page, 4, 400) // snap the left half first

  const win = page
    .locator('section')
    .filter({ has: page.locator('header').getByText('Agent Chat', { exact: true }) })

  await test.step('a sideways drag inside the top band never maximizes', async () => {
    // A left-snapped header (y 4-40) starts near the top band; a small
    // sideways drag must unsnap-restore and follow the pointer, never
    // maximize (the regression m-vawter measured).
    const handle = win.locator('header')
    const box = await handle.boundingBox()
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
    await page.mouse.down()
    await page.mouse.move(box!.x + box!.width / 2 + 40, box!.y + box!.height / 2 + 1, {
      steps: 4,
    })
    await page.mouse.up()

    const after = await win.boundingBox()
    expect(after!.width).toBe(520) // pre-snap width, not 1280
    expect(after!.height).toBe(560)
    expect(after!.x).not.toBe(0) // no longer snapped
  })

  await test.step('a 1px jitter click keeps the snap', async () => {
    const before = await win.boundingBox()
    const handle = win.locator('header')
    const box = await handle.boundingBox()
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
    await page.mouse.down()
    await page.mouse.move(box!.x + box!.width / 2 + 1, box!.y + box!.height / 2, { steps: 2 })
    await page.mouse.up()

    const after = await win.boundingBox()
    expect(after!.x).toBe(before!.x)
    expect(after!.width).toBe(before!.width)
  })

    await test.step('dragging away restores the pre-snap rect including y', async () => {
    const handle = win.locator('header')
    const box = await handle.boundingBox()
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
    await page.mouse.down()
    const px = box!.x + box!.width / 2 + 200
    const py = box!.y + box!.height / 2 + 200
    await page.mouse.move(px, py, { steps: 6 })
    await page.mouse.up()

    const after = await win.boundingBox()
    expect(after!.width).toBe(520)
    expect(after!.height).toBe(560)
    // Windows-style restore: the pointer keeps its title-bar grab spot, so
    // the restored window's header still contains the pointer (review
    // guard). The stale-origin bug teleported it away from the pointer.
    const header = await handle.boundingBox()
    expect(header!.x).toBeLessThanOrEqual(px)
    expect(header!.x + header!.width).toBeGreaterThanOrEqual(px)
    expect(header!.y).toBeLessThanOrEqual(py)
    expect(header!.y + header!.height).toBeGreaterThanOrEqual(py)
  })
})

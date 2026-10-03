import type { Locator, Page } from '@playwright/test'
import type { UpdateAppParams } from '../../../app/features/chat/tools/schemas'

/** The test hooks `app/app.vue` puts on `window.__dominic` once it mounts. */
interface DominicHooks {
  installFixture(fixtureId: string): boolean
  updateApp(params: UpdateAppParams): void
  injectBrokenApp(type?: 'compile' | 'runtime'): void
}

declare global {
  interface Window {
    __dominic?: DominicHooks
  }
}

/**
 * Keep every request on the app's own origin. The page loads the Tailwind
 * Play CDN from its `<head>`; the shell's classes are compiled at build time,
 * so the suite runs offline and no third-party host can make it flaky.
 */
export async function keepRequestsLocal(page: Page, baseURL: string | undefined): Promise<void> {
  if (!baseURL) throw new Error('Set use.baseURL in playwright.config.ts')
  const { origin } = new URL(baseURL)
  await page.route(
    (url) => url.origin !== origin,
    (route) => route.abort('blockedbyclient'),
  )
}

/** Wait until the desktop has mounted and its test hooks exist. */
export async function waitForDesktop(page: Page): Promise<void> {
  await page.waitForFunction(() => window.__dominic !== undefined)
}

/** Open the desktop and wait for it to mount. */
export async function openDesktop(page: Page): Promise<void> {
  await page.goto('/')
  await waitForDesktop(page)
}

/** Call the `window.__dominic` hooks from the test. */
export function dominicHooks(page: Page) {
  return {
    installFixture: (fixtureId: string) =>
      page.evaluate((id) => window.__dominic!.installFixture(id), fixtureId),
    updateApp: (params: UpdateAppParams) =>
      page.evaluate((p) => window.__dominic!.updateApp(p), params),
    injectBrokenApp: (type: 'compile' | 'runtime') =>
      page.evaluate((t) => window.__dominic!.injectBrokenApp(t), type),
  }
}

/** A desktop window, found by the exact title in its title bar. */
export function appWindow(page: Page, title: string): Locator {
  return page
    .locator('section')
    .filter({ has: page.locator('header').getByText(title, { exact: true }) })
}

import { expect, test } from '@playwright/test'
import { stubAgentReply } from './support/agent-stub'
import { appWindow, dominicHooks, keepRequestsLocal, openDesktop } from './support/desktop'

// #92: "Ask Agent to Fix" must reach the agent even when Agent Chat was
// closed. The click reopens the chat window; the message has to wait for that
// window to mount instead of being dropped.

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

test('Ask Agent to Fix reopens a closed Agent Chat and still reaches the agent', async ({ page }) => {
  const dominic = dominicHooks(page)
  const chat = appWindow(page, 'Agent Chat')
  const broken = appWindow(page, 'Broken (Syntax Error)')
  await openDesktop(page)

  await chat.getByRole('button', { name: 'Close' }).click()
  await expect(chat).toHaveCount(0)

  await dominic.injectBrokenApp('compile')
  await expect(broken.getByText('Component Compilation Error')).toBeVisible()

  const requests = await stubAgentReply(page, {
    text: 'Found the bug; sending a fixed version.',
    updateApp: { id: 'broken-app', vueSfcCode: REPAIRED_APP, summary: 'Fix the deliberate error' },
  })
  await broken.getByRole('button', { name: 'Ask Agent to Fix' }).click()

  await expect(chat).toBeVisible()
  await expect(broken.getByRole('heading', { name: 'Repaired by the agent' })).toBeVisible()
  expect(requests).toHaveLength(1)
})

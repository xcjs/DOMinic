import type { Page } from '@playwright/test'
import { formatDataStreamPart } from 'ai'
import type { UpdateAppParams } from '../../../app/features/chat/tools/schemas'

/** The parts of the `/api/chat` request body the tests check. */
export interface ChatRequestBody {
  messages: { role: string; content: string }[]
  installedApps: { id: string }[]
}

export interface AgentReply {
  /** Assistant text, sent as a `0:` part before the tool call. */
  text: string
  /** Arguments of the single `update_app` tool call (a `9:` part). */
  updateApp: UpdateAppParams
}

const USAGE = { promptTokens: 1, completionTokens: 1 }

/**
 * Answer `POST /api/chat` in the browser, so no provider or API key is
 * involved. The body is what the server's `toDataStreamResponse()` sends for
 * a text-then-tool-call turn, encoded with the same AI SDK the server uses:
 *
 *   f:{"messageId":…}  0:"text"  9:{toolCallId,toolName,args}  e:{…}  d:{…}
 *
 * one part per line, each ending in "\n" (the client parser drops a final
 * line that has no newline). Returns the request bodies, in order.
 */
export async function stubAgentReply(page: Page, reply: AgentReply): Promise<ChatRequestBody[]> {
  const requests: ChatRequestBody[] = []

  await page.route('**/api/chat', async (route) => {
    requests.push(route.request().postDataJSON() as ChatRequestBody)
    await route.fulfill({
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Vercel-AI-Data-Stream': 'v1',
      },
      body: [
        formatDataStreamPart('start_step', { messageId: 'msg-e2e' }),
        formatDataStreamPart('text', reply.text),
        formatDataStreamPart('tool_call', {
          toolCallId: 'call-e2e',
          toolName: 'update_app',
          args: reply.updateApp,
        }),
        formatDataStreamPart('finish_step', {
          finishReason: 'tool-calls',
          usage: USAGE,
          isContinued: false,
        }),
        formatDataStreamPart('finish_message', { finishReason: 'tool-calls', usage: USAGE }),
      ].join(''),
    })
  })

  return requests
}

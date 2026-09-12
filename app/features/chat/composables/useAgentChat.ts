import { ref, computed } from 'vue'
import type { ChatMessage, ToolInvocation, ProviderConfig } from '../types/chat'
import type { InstallAppParams, UpdateAppParams } from '../tools/schemas'
import { isDemoMode } from '../demo/demoMode'
import { createDemoChatResponse } from '../demo/demoAgent'

export interface UseAgentChatOptions {
  getProviderConfig?: () => ProviderConfig | null
  getInstalledApps?: () => Array<{ id: string; title: string; icon?: string; description?: string }>
  onInstallApp?: (params: InstallAppParams) => Promise<boolean | void> | boolean | void
  onUpdateApp?: (params: UpdateAppParams) => Promise<boolean | void> | boolean | void
  onOpenWindow?: (appId: string) => void
}

function parseStreamError(data: string): string {
  try {
    const parsed: unknown = JSON.parse(data)
    if (typeof parsed === 'string') return parsed
    if (parsed && typeof parsed === 'object') {
      const details = parsed as Record<string, unknown>
      if (typeof details.message === 'string') return details.message
      if (typeof details.error === 'string') return details.error
    }
  } catch {
    // Some providers return an unquoted error message.
  }
  return data.trim() || 'The chat request failed'
}

export function useAgentChat(options: UseAgentChatOptions = {}) {
  const messages = ref<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello! I am **DOMinic**, your resident software engineer. Tell me what app, tool, or widget you want to build, and I will write, compile, and install it into your desktop right now.',
      createdAt: Date.now()
    }
  ])

  const input = ref('')
  const isStreaming = ref(false)
  const error = ref<string | null>(null)

  const hasApiKey = computed(() => {
    const config = options.getProviderConfig?.()
    return isDemoMode(config) || !!config?.apiKey
  })

  async function sendMessage(text?: string) {
    const content = (text || input.value).trim()
    if (!content || isStreaming.value) return

    input.value = ''
    error.value = null

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      createdAt: Date.now()
    }
    messages.value.push(userMessage)

    const assistantMessageId = `asst-${Date.now()}`
    const assistantMessage = ref<ChatMessage>({
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
      toolInvocations: []
    })
    messages.value.push(assistantMessage.value)

    isStreaming.value = true

    try {
      const providerConfig = options.getProviderConfig?.() || {
        provider: 'openai',
        model: 'gpt-4o',
        apiKey: ''
      }
      const installedApps = options.getInstalledApps?.() || []

      // Demo mode (opt-in, offline): a scripted agent streams the same
      // data-stream protocol, so everything below this line is unchanged.
      const response = isDemoMode(providerConfig)
        ? createDemoChatResponse(content, installedApps)
        : await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Provider-safe history: no seeded welcome turn (Anthropic requires the
          // first turn to be the user's) and no empty assistant turns (tool-only
          // replies have no text; Anthropic rejects empty content blocks).
          messages: messages.value
            .filter((m) => m.id !== 'welcome' && (m.role === 'user' || m.role === 'assistant'))
            .map((m) => ({
              role: m.role,
              content:
                m.content.trim() ||
                (m.toolInvocations?.length
                  ? `(called ${m.toolInvocations.map((t) => t.toolName).join(', ')})`
                  : '')
            }))
            .filter((m) => m.content.length > 0),
          provider: providerConfig.provider,
          model: providerConfig.model,
          apiKey: providerConfig.apiKey,
          baseUrl: providerConfig.baseUrl,
          installedApps
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ statusMessage: response.statusText }))
        throw new Error(errorData.statusMessage || `Error ${response.status}: Failed to reach chat kernel`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('Response body is not readable')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.trim()) continue

          // Handle AI SDK data stream protocol:
          // 0: "text" -> text chunk
          // 9: { toolCallId, toolName, args } -> tool call
          // a: { toolCallId, result } -> tool result
          // 3: error
          const prefix = line.slice(0, 2)
          const dataStr = line.slice(2)

          if (prefix === '0:') {
            // Text chunk
            try {
              const textChunk = JSON.parse(dataStr)
              assistantMessage.value.content += textChunk
            } catch {
              assistantMessage.value.content += dataStr
            }
          } else if (prefix === '9:') {
            // Tool call
            try {
              const toolCall = JSON.parse(dataStr)
              const invocation: ToolInvocation = {
                toolCallId: toolCall.toolCallId,
                toolName: toolCall.toolName,
                args: toolCall.args,
                state: 'call'
              }

              if (!assistantMessage.value.toolInvocations) {
                assistantMessage.value.toolInvocations = []
              }
              assistantMessage.value.toolInvocations.push(invocation)

              // Execute tool on client
              handleToolCall(invocation)
            } catch (err) {
              console.error('Failed to parse tool call chunk:', err)
            }
          } else if (prefix === '3:') {
            throw new Error(parseStreamError(dataStr))
          }
        }
      }
    } catch (err: any) {
      error.value = err?.message || 'Chat error occurred'
      const separator = assistantMessage.value.content.trim() ? '\n\n' : ''
      assistantMessage.value.content += `${separator}I could not complete that request. ${error.value}`
    } finally {
      const hasToolCall = (assistantMessage.value.toolInvocations?.length ?? 0) > 0
      if (!assistantMessage.value.content.trim() && !hasToolCall) {
        error.value = 'DOMinic did not return a response. Please try again.'
        assistantMessage.value.content = error.value
      }
      isStreaming.value = false
    }
  }

  async function handleToolCall(invocation: ToolInvocation) {
    if (invocation.toolName === 'install_app') {
      try {
        const params = invocation.args as InstallAppParams
        await options.onInstallApp?.(params)
        options.onOpenWindow?.(params.id)
        invocation.state = 'result'
        invocation.result = { success: true, message: `Installed and launched "${params.title}"` }
      } catch (err: any) {
        invocation.state = 'result'
        invocation.result = { success: false, error: err?.message || 'Installation failed' }
      }
    } else if (invocation.toolName === 'update_app') {
      try {
        const params = invocation.args as UpdateAppParams
        await options.onUpdateApp?.(params)
        invocation.state = 'result'
        invocation.result = { success: true, message: `Updated "${params.id}"` }
      } catch (err: any) {
        invocation.state = 'result'
        invocation.result = { success: false, error: err?.message || 'Update failed' }
      }
    }
  }

  function clearHistory() {
    messages.value = [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Chat session reset. What shall we build next?',
        createdAt: Date.now()
      }
    ]
    error.value = null
  }

  return {
    messages,
    input,
    isStreaming,
    error,
    hasApiKey,
    sendMessage,
    clearHistory
  }
}

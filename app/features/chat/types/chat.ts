export type MessageRole = 'user' | 'assistant' | 'system'

export interface ToolInvocation {
  toolCallId: string
  toolName: string
  args: any
  state: 'call' | 'result'
  result?: any
}

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  createdAt?: number
  toolInvocations?: ToolInvocation[]
}

export interface ProviderConfig {
  provider: 'openai' | 'anthropic' | 'google' | 'deepseek' | 'custom'
  model: string
  apiKey: string
  baseUrl?: string
}

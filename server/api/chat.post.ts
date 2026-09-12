import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { buildSystemPrompt } from '../../app/features/chat/prompts/systemPrompt'
import { installAppSchema, updateAppSchema } from '../../app/features/chat/tools/schemas'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const {
    messages,
    provider = 'openai',
    model: requestedModel,
    apiKey: clientApiKey,
    baseUrl: clientBaseUrl,
    installedApps = []
  } = body || {}

  if (!messages || !Array.isArray(messages)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request: "messages" array is required'
    })
  }

  // Resolve API key: per-request client key takes precedence, fallback to server env
  let apiKey = clientApiKey
  if (!apiKey) {
    if (provider === 'openai') apiKey = process.env.OPENAI_API_KEY
    else if (provider === 'anthropic') apiKey = process.env.ANTHROPIC_API_KEY
    else if (provider === 'google') apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    else if (provider === 'deepseek') apiKey = process.env.DEEPSEEK_API_KEY
  }

  if (!apiKey) {
    throw createError({
      statusCode: 401,
      statusMessage: `No API key provided for ${provider}. Please enter your API key in Settings.`
    })
  }

  // Configure provider instance with current frontier model defaults
  let modelInstance: any
  if (provider === 'anthropic') {
    const anthropic = createAnthropic({ apiKey })
    modelInstance = anthropic(requestedModel || 'claude-sonnet-5')
  } else if (provider === 'google') {
    const google = createGoogleGenerativeAI({ apiKey })
    modelInstance = google(requestedModel || 'gemini-2.5-pro')
  } else if (provider === 'deepseek') {
    const deepseek = createOpenAI({
      apiKey,
      baseURL: clientBaseUrl || process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com'
    })
    modelInstance = deepseek(requestedModel || 'deepseek-chat')
  } else if (provider === 'custom') {
    if (!clientBaseUrl) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Custom provider requires a Base URL in Settings'
      })
    }
    if (!requestedModel) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Custom provider requires a model'
      })
    }
    const custom = createOpenAI({ apiKey, baseURL: clientBaseUrl })
    modelInstance = custom(requestedModel)
  } else {
    // Default OpenAI
    const openai = createOpenAI({
      apiKey,
      baseURL: clientBaseUrl || process.env.OPENAI_BASE_URL
    })
    modelInstance = openai(requestedModel || 'gpt-5')
  }

  const system = buildSystemPrompt(installedApps)

  const result = streamText({
    model: modelInstance,
    system,
    messages,
    tools: {
      install_app: {
        description:
          'Install and launch a new application in DOMinic OS. Provide complete Vue 3 SFC code with <template> and <script setup>.',
        parameters: installAppSchema
      },
      update_app: {
        description:
          'Update the source code of an existing installed application in DOMinic OS.',
        parameters: updateAppSchema
      }
    },
    maxSteps: 3
  })

  return result.toDataStreamResponse()
})

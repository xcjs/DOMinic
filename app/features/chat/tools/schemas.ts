import { z } from 'zod'

export const installAppSchema = z.object({
  id: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'App ID must be kebab-case lowercase alphanumeric and hyphens')
    .describe('Unique kebab-case identifier for the app, e.g. "pomodoro-timer" or "crypto-tracker"'),
  title: z
    .string()
    .min(1)
    .max(50)
    .describe('Human-readable window and launcher title, e.g. "Pomodoro Timer"'),
  icon: z
    .string()
    .default('Sparkles')
    .describe('Valid Lucide icon name, e.g. "Timer", "Calculator", "TrendingUp", "Cloud", "Music", "CheckSquare"'),
  description: z
    .string()
    .max(200)
    .describe('One-sentence summary of the app capabilities'),
  vueSfcCode: z
    .string()
    .min(20)
    .describe(
      'Full Vue 3 Single File Component string containing <template> and <script setup>. Must use Tailwind utility classes and Vue 3 composition API.'
    )
})

export const updateAppSchema = z.object({
  id: z
    .string()
    .describe('ID of the existing installed app to update'),
  vueSfcCode: z
    .string()
    .min(20)
    .describe('Complete updated Vue 3 SFC source code'),
  summary: z
    .string()
    .describe('Brief explanation of changes and improvements made')
})

export type InstallAppParams = z.infer<typeof installAppSchema>
export type UpdateAppParams = z.infer<typeof updateAppSchema>

/**
 * Scripted, offline stand-in for /api/chat used only when demo mode is on.
 *
 * It produces a `Response` whose body speaks the exact Vercel AI SDK data-stream
 * protocol the real endpoint returns (`0:` text, `9:` tool call, `e:`/`d:` finish),
 * so `useAgentChat` parses it with the same code path as a live model.
 */
import pomodoroManifest from '../../apps/fixtures/pomodoro-timer/manifest.json'
import pomodoroV1 from '../../apps/fixtures/pomodoro-timer/index.vue.txt?raw'
import pomodoroV2 from './sfc/pomodoro-v2.vue.txt?raw'
import weatherBroken from './sfc/weather-broken.vue.txt?raw'
import weatherFixed from './sfc/weather-fixed.vue.txt?raw'
import stickyNotes from './sfc/sticky-notes.vue.txt?raw'

export interface DemoInstalledApp {
  id: string
  title?: string
}

type Step =
  | { kind: 'wait'; ms: number }
  | { kind: 'text'; text: string; msPerWord?: number }
  | { kind: 'tool'; toolName: 'install_app' | 'update_app'; args: Record<string, unknown> }

const wait = (ms: number): Step => ({ kind: 'wait', ms })
const say = (text: string, msPerWord = 45): Step => ({ kind: 'text', text, msPerWord })
const tool = (toolName: 'install_app' | 'update_app', args: Record<string, unknown>): Step => ({
  kind: 'tool',
  toolName,
  args
})

const WEATHER_ID = 'weather-widget'
const POMODORO_ID = pomodoroManifest.id

function installPomodoroScript(): Step[] {
  return [
    wait(900),
    say(
      'On it. A retro synthwave Pomodoro: I will write a Vue component with 25-minute focus and 5-minute break cycles, start, pause and reset controls, and a confetti burst when a session completes.'
    ),
    wait(900),
    say('\n\nGenerating the component and compiling it for your desktop...', 60),
    wait(2600),
    tool('install_app', {
      id: POMODORO_ID,
      title: pomodoroManifest.title,
      icon: pomodoroManifest.icon,
      description: pomodoroManifest.description,
      vueSfcCode: pomodoroV1
    }),
    wait(700),
    say(
      '\n\nInstalled. Pomodoro Timer is open on your desktop and pinned to the launcher. Hit Start to begin a focus session.'
    )
  ]
}

function updatePomodoroScript(): Step[] {
  return [
    wait(800),
    say(
      'Sure. I will rework the palette into a neon synthwave theme with a retro sun and a perspective grid, and make the break a five-minute countdown.'
    ),
    wait(800),
    say('\n\nPatching /apps/pomodoro-timer/index.vue in place...', 60),
    wait(2200),
    tool('update_app', {
      id: POMODORO_ID,
      vueSfcCode: pomodoroV2,
      summary: 'Break set to 05:00; neon synthwave restyle with retro sun, grid floor and a Synthwave v2 badge.'
    }),
    wait(600),
    say(
      '\n\nDone: the break is now 05:00, and the timer has a neon grid backdrop, a retro sun and a Synthwave v2 badge. Your running window updated in place without a reload.'
    )
  ]
}

function installBrokenWeatherScript(): Step[] {
  return [
    wait(800),
    say('Adding a compact weather widget that shows today\'s forecast for Columbus.'),
    wait(700),
    say('\n\nCompiling the component...', 60),
    wait(1800),
    tool('install_app', {
      id: WEATHER_ID,
      title: 'Weather Widget',
      icon: '🌤️',
      description: 'Compact local weather card with today\'s forecast.',
      vueSfcCode: weatherBroken
    }),
    wait(600),
    say('\n\nWeather Widget is installed and open on your desktop.')
  ]
}

function fixScript(targetId: string, installed: DemoInstalledApp[]): Step[] {
  const isInstalled = installed.some((a) => a.id === targetId)
  const isWeather = targetId === WEATHER_ID
  const diagnosis = isWeather
    ? 'I see the problem: the component reads forecast.temperature before the forecast object exists, so it throws a TypeError during setup. I will initialize the forecast with default data so the first render is always safe.'
    : 'I see the problem: the component throws during setup before its state is initialized. I will rewrite it with safe defaults so it mounts cleanly.'

  let source = weatherFixed
  if (targetId === POMODORO_ID) source = pomodoroV2
  else if (targetId === 'sticky-notes') source = stickyNotes

  const toolStep: Step = isInstalled
    ? tool('update_app', {
        id: targetId,
        vueSfcCode: source,
        summary: isWeather
          ? 'Initialize the forecast with default data before the first render; add an hourly strip and a refresh button.'
          : 'Rewrite setup with safe defaults so the component mounts without throwing.'
      })
    : tool('install_app', {
        id: WEATHER_ID,
        title: 'Weather Widget',
        icon: '🌤️',
        description: 'Compact local weather card with today\'s forecast.',
        vueSfcCode: weatherFixed
      })

  return [
    wait(900),
    say(diagnosis),
    wait(800),
    say('\n\nApplying the fix...', 60),
    wait(2000),
    toolStep,
    wait(600),
    say(
      isWeather
        ? '\n\nFixed. The widget now boots with a default forecast and renders cleanly, with an hourly strip and a refresh button.'
        : '\n\nFixed. The app now mounts cleanly.'
    )
  ]
}

function genericScript(): Step[] {
  return [
    wait(800),
    say(
      'Happy to help. I will start with a quick Sticky Notes app you can use right away, and we can iterate from there.'
    ),
    wait(700),
    say('\n\nCompiling the component...', 60),
    wait(1800),
    tool('install_app', {
      id: 'sticky-notes',
      title: 'Sticky Notes',
      icon: '📝',
      description: 'Quick sticky notes that persist in the virtual filesystem.',
      vueSfcCode: stickyNotes
    }),
    wait(600),
    say('\n\nSticky Notes is installed. Your notes persist in the DOMinic virtual filesystem across reloads.')
  ]
}

/** Picks a canned script from keywords in the last user message. */
export function buildDemoScript(message: string, installed: DemoInstalledApp[]): Step[] {
  const text = message.toLowerCase()
  const has = (id: string) => installed.some((a) => a.id === id)
  const mentionsPomodoro = /pomodoro|timer|focus/.test(text)

  // 1. Fix requests (including the "Ask Agent to Fix" button's message).
  const fixMatch = message.match(/The app ([a-z0-9-]+) encountered/i)
  if (fixMatch || /\b(fix|repair)\b/.test(text)) {
    let target = fixMatch?.[1]
    if (!target) {
      if (has(WEATHER_ID)) target = WEATHER_ID
      else if (mentionsPomodoro && has(POMODORO_ID)) target = POMODORO_ID
      else target = installed[installed.length - 1]?.id || WEATHER_ID
    }
    return fixScript(target, installed)
  }

  // 2. Deliberately install an app that throws on mount (the Recover beat).
  if (/break it|crash|throw|blow up|broken app|that fails/.test(text)) {
    return installBrokenWeatherScript()
  }

  // 3. Fresh build requests for the timer always install.
  if (mentionsPomodoro && /\b(build|create|generate|write|new)\b/.test(text)) {
    return installPomodoroScript()
  }

  // 4. Change requests against an installed timer update it in place.
  if (
    has(POMODORO_ID) &&
    /\b(five|5|synthwave|change|update|make|give|tweak|switch|turn|restyle|theme|colou?r|look)\b/.test(text)
  ) {
    return updatePomodoroScript()
  }

  // 5. Any other timer talk installs it.
  if (mentionsPomodoro) return installPomodoroScript()

  // 6. Anything else still produces a window.
  return genericScript()
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Streams a canned script as an AI SDK data-stream `Response`. */
export function createDemoChatResponse(message: string, installed: DemoInstalledApp[]): Response {
  const steps = buildDemoScript(message, installed)
  const encoder = new TextEncoder()
  let toolCounter = 0

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const push = (line: string) => controller.enqueue(encoder.encode(line + '\n'))
      try {
        for (const step of steps) {
          if (step.kind === 'wait') {
            await sleep(step.ms)
          } else if (step.kind === 'text') {
            const tokens = step.text.split(/(?<=\s)/)
            for (const token of tokens) {
              push('0:' + JSON.stringify(token))
              await sleep(step.msPerWord ?? 45)
            }
          } else {
            toolCounter += 1
            push(
              '9:' +
                JSON.stringify({
                  toolCallId: `demo-${Date.now()}-${toolCounter}`,
                  toolName: step.toolName,
                  args: step.args
                })
            )
          }
        }
        const usage = { promptTokens: 0, completionTokens: 0 }
        push('e:' + JSON.stringify({ finishReason: 'stop', usage, isContinued: false }))
        push('d:' + JSON.stringify({ finishReason: 'stop', usage }))
      } finally {
        controller.close()
      }
    }
  })

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'x-vercel-ai-data-stream': 'v1'
    }
  })
}

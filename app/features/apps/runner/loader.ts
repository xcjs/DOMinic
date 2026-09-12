import * as Vue from 'vue'
import * as VueUse from '@vueuse/core'
import * as LucideIcons from 'lucide-vue-next'
import confetti from 'canvas-confetti'
import { loadModule } from 'vue3-sfc-loader'

export interface LoadAppOptions {
  sourceCode: string
  appId?: string
}

export async function compileVueSfc(options: LoadAppOptions): Promise<any> {
  const { sourceCode, appId = 'dynamic-app' } = options

  const sfcOptions = {
    moduleCache: {
      vue: Vue,
      '@vueuse/core': VueUse,
      'lucide-vue-next': LucideIcons,
      'canvas-confetti': confetti
    },
    async getFile(url: string) {
      if (url === '/app.vue' || url === `/${appId}.vue`) {
        return sourceCode
      }
      // If external npm package
      const fetchUrl = url.startsWith('http') ? url : `https://esm.sh/${url}?bundle`
      const res = await fetch(fetchUrl)
      if (!res.ok) {
        throw new Error(`Failed to load external dependency "${url}": HTTP ${res.status}`)
      }
      return await res.text()
    },
    addStyle(textContent: string) {
      const style = document.createElement('style')
      style.textContent = textContent
      style.setAttribute('data-app-id', appId)
      document.head.appendChild(style)
    }
  }

  return await (loadModule as any)(`/${appId}.vue`, sfcOptions)
}

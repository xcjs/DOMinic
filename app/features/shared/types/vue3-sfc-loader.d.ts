declare module 'vue3-sfc-loader' {
  export interface SfcLoaderOptions {
    moduleCache?: Record<string, any>
    getFile?: (url: string) => Promise<string> | string
    addStyle?: (textContent: string) => void
    handleModule?: (type: string, getContentData: () => Promise<string>, path: string, options: any) => Promise<any>
    [key: string]: any
  }

  export function loadModule(path: string, options: SfcLoaderOptions): Promise<any>
}

export interface AppDefinition {
  id: string
  name: string
  icon: string
  component?: string
}

export interface WindowInstance {
  id: string
  appId: string
  title: string
  icon: string
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  minimized: boolean
  maximized: boolean
}

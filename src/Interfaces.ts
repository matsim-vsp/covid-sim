export enum ColorScheme {
  LightMode = 'light',
  DarkMode = 'dark',
}

export interface ColorSet {
  background: number
  links: number
  susceptible: number
  infectedButNotContagious: number
  contagious: number
}

export enum Health {
  Susceptible = 'susceptible',
  InfectedButNotContagious = 'infectedButNotContagious',
  Contagious = 'contagious',
}

export interface Agent {
  id: string
  time: number[]
  path: [number, number][]
  dtime: number[]
  d: number[]
}

export interface Infection {
  id: string
  dtime: number[]
  d: number[]
}

export interface Trip {
  id: number
  timestamps: number[]
  path?: number[]
  status?: string
}

export enum ColorScheme {
  LightMode = 'light',
  DarkMode = 'dark',
}

export interface ColorSet {
  text: string
  background: string
  links: string
  susceptible: string
  infectedButNotContagious: string
  contagious: string
  symptomatic: string
  seriouslyIll: string
  critical: string
  recovered: string
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

export interface RunYaml {
  city: string
  info: string
  readme: string
  zip: string
  offset: number[]
  dayZero: string
  timestamp?: string
  optionGroups: {
    day: number
    heading: string
    subheading?: string
    measures: {
      measure: string
      title: string
      options?: number[]
    }[]
  }[]
}

export const LIGHT_MODE: ColorSet = {
  text: '#000',
  background: '#ccccc4',
  links: '#ffffff',
  susceptible: '#999900',
  infectedButNotContagious: '#0077ff',
  contagious: '#bb0044',
  symptomatic: '#ff5533',
  seriouslyIll: '#7733ee',
  critical: '#000',
  recovered: '#116622',
}

export const DARK_MODE: ColorSet = {
  text: '#fff',
  background: '#181518',
  links: '#445577',
  susceptible: '#bbbb44',
  infectedButNotContagious: '#00dddd',
  contagious: '#ff2299',
  symptomatic: '#ff5533',
  seriouslyIll: '#7733ee',
  critical: '#fff',
  recovered: '#116622',
}

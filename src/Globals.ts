export const PUBLIC_SVN =
  'https://svn.vsp.tu-berlin.de/repos/public-svn/matsim/scenarios/countries/de/episim/'

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

export interface AgentProgessingThroughDisease {
  id: string
  x: number
  y: number
  infectedButNotContagious: number
  contagious: number
  showingSymptoms: number
  seriouslySick: number
  critical: number
  recovered: number
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
  zipFolder: string
  timestamp: string
  // these are for old version
  offset?: number[]
  startDate?: string
  endDate?: string
  // these are for new version
  defaultStartDate?: string
  startDates?: string[]
  //heat map max
  heatMapMaxValue?: number
  // Starting date for left-panel R-Value statistic
  rValueDate?: string
  // these are for everything
  optionGroups: {
    day?: number
    heading: string
    subheading?: string
    measures: {
      measure: string
      title: string
      order?: string
      options?: number[]
      asPercent?: boolean
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
  contagious: '#bb2222',
  symptomatic: '#ff5533',
  seriouslyIll: '#7733ee',
  critical: '#f6f',
  recovered: '#116622',
}

export enum LegendItemType {
  line,
  box,
}

export interface LegendItem {
  type: LegendItemType
  color: number[]
  value: any
  label?: string
}

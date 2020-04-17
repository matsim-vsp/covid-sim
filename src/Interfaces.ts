export enum ColorScheme {
  LightMode = 'light',
  DarkMode = 'dark',
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
  disease_time: number[]
  disease: number[]
}

import Papa from '@simwrapper/papaparse'
import moment from 'moment'

/**
 * One observed (real-world) data series, declared in the `observed` list of metadata.yaml:
 *
 * ```yaml
 * observed:
 *   - name: Influenza notifications NRW (RKI IfSG)
 *     url: observed/nrw-ifsg-influenza-2025-26.tsv
 *     date: week
 *     value: cases
 *     period: week
 *     unit: count
 *     population: 18139116
 *     plots: [casCom]
 * ```
 */
export interface ObservedDefinition {
  // legend label
  name: string
  // absolute URL, or a path relative to the run folder (the folder holding metadata.yaml)
  url: string
  // column holding the date: ISO date (2025-09-28) or ISO week (2025-W39)
  date: string
  // column holding the value
  value: string
  // time span one value covers; weekly values are dated on the last day (Sunday) of their week
  period?: 'day' | 'week'
  // count: scaled to 7 days per 100k using `population`; per100k: already scaled;
  // concentration: plotted as is (e.g. sewage), on the secondary axis by default
  unit?: 'count' | 'per100k' | 'concentration'
  // real population the counts refer to; required for unit 'count'
  population?: number
  // abbreviations of the plots showing this series, e.g. casCom, hospNewCas
  plots: string[]
  axis?: 'y' | 'y2'
  color?: string
}

/**
 * An observed series ready to plot: 7-day values per 100k (or the raw values of a concentration),
 * each dated on the last day of the 7 days it covers. Plots whose model points sit mid-week shift
 * these dates themselves.
 */
export interface ObservedSeries {
  definition: ObservedDefinition
  axis: 'y' | 'y2'
  x: string[]
  y: number[]
}

const ISO_WEEK = /^(\d{4})-W(\d{1,2})$/

/** Parses an ISO date or ISO week; a week becomes its last day, Sunday. */
export function parseObservedDate(value: string): string | null {
  const text = ('' + value).trim()

  const week = text.match(ISO_WEEK)
  if (week) {
    const monday = moment(`${week[1]}-W${week[2].padStart(2, '0')}-1`, 'GGGG-[W]WW-E', true)
    return monday.isValid() ? monday.add(6, 'days').format('YYYY-MM-DD') : null
  }

  const date = moment(text, 'YYYY-MM-DD', true)
  return date.isValid() ? date.format('YYYY-MM-DD') : null
}

export function resolveObservedUrl(url: string, runFolderUrl: string) {
  if (/^https?:\/\//.test(url)) return url
  return runFolderUrl.replace(/\/?$/, '/') + url.replace(/^\.?\//, '')
}

/** Parses delimited text with a header row; lines starting with # are comments. */
export function parseObservedText(text: string): any[] {
  const content = text
    .split(/\r?\n/)
    .filter(line => !line.startsWith('#'))
    .join('\n')

  return Papa.parse(content, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    delimitersToGuess: ['\t', ',', ';'],
  }).data as any[]
}

/** Turns parsed rows into a plottable series; throws if the definition does not fit the data. */
export function buildObservedSeries(definition: ObservedDefinition, rows: any[]): ObservedSeries {
  const unit = definition.unit || 'count'
  const period = definition.period || 'week'

  if (unit === 'count' && !(definition.population! > 0)) {
    throw Error(`observed "${definition.name}": unit 'count' needs a population`)
  }
  if (rows.length && !(definition.date in rows[0])) {
    throw Error(`observed "${definition.name}": no column '${definition.date}'`)
  }
  if (rows.length && !(definition.value in rows[0])) {
    throw Error(`observed "${definition.name}": no column '${definition.value}'`)
  }

  const points: { date: string; value: number }[] = []
  for (const row of rows) {
    const date = parseObservedDate(row[definition.date])
    const value = row[definition.value]
    // empty or non-numeric values are missing observations, not zeros
    if (!date || typeof value !== 'number' || isNaN(value)) continue
    points.push({ date, value })
  }
  points.sort((a, b) => (a.date < b.date ? -1 : 1))

  const x: string[] = []
  const y: number[] = []

  if (unit === 'concentration') {
    for (const p of points) {
      x.push(p.date)
      y.push(p.value)
    }
  } else {
    const scale = unit === 'count' ? 100000 / definition.population! : 1

    if (period === 'week') {
      for (const p of points) {
        x.push(p.date)
        y.push(p.value * scale)
      }
    } else {
      // daily values: sum the 7 days ending on each date, skipping windows with missing days
      const byDate = new Map(points.map(p => [p.date, p.value]))
      for (const p of points) {
        let sum = 0
        let complete = true
        for (let back = 0; back < 7; back++) {
          const value = byDate.get(moment(p.date).subtract(back, 'days').format('YYYY-MM-DD'))
          if (value === undefined) {
            complete = false
            break
          }
          sum += value
        }
        if (!complete) continue
        x.push(p.date)
        y.push(sum * scale)
      }
    }
  }

  const axis = definition.axis || (unit === 'concentration' ? 'y2' : 'y')
  return { definition, axis, x, y }
}

/** Loads all observed series; a series that fails to load is reported and left out. */
export async function loadObservedSeries(
  definitions: ObservedDefinition[],
  runFolderUrl: string
): Promise<ObservedSeries[]> {
  const loaded = await Promise.all(
    definitions.map(async definition => {
      const url = resolveObservedUrl(definition.url, runFolderUrl)
      try {
        const response = await fetch(url)
        if (!response.ok) throw Error(`HTTP ${response.status}`)
        return buildObservedSeries(definition, parseObservedText(await response.text()))
      } catch (e) {
        console.error(`Could not load observed data "${definition.name}" from ${url}: ${e}`)
        return null
      }
    })
  )

  return loaded.filter(series => series !== null) as ObservedSeries[]
}

/** Plotly trace for a series, with its dates shifted by `dayOffset` to line up with the model. */
export function observedTrace(series: ObservedSeries, dayOffset = 0) {
  return {
    name: series.definition.name,
    visible: true,
    type: 'scatter',
    mode: 'markers',
    yaxis: series.axis,
    x: series.x.map(d => moment(d).add(dayOffset, 'days').format('YYYY-MM-DD')),
    y: series.y,
    marker: { size: 5, ...(series.definition.color ? { color: series.definition.color } : {}) },
  }
}

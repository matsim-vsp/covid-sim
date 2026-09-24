import {
  buildObservedSeries,
  parseObservedDate,
  parseObservedText,
  resolveObservedUrl,
} from '@/util/observedData'

describe('observedData', () => {
  it('parses ISO weeks as their Sunday and ISO dates as themselves', () => {
    expect(parseObservedDate('2025-W39')).toBe('2025-09-28')
    expect(parseObservedDate('2026-W01')).toBe('2026-01-04')
    expect(parseObservedDate('2025-09-28')).toBe('2025-09-28')
    expect(parseObservedDate('28.09.2025')).toBeNull()
  })

  it('resolves paths relative to the run folder', () => {
    const run = 'https://svn/battery/jaro/run'
    expect(resolveObservedUrl('observed/a.tsv', run)).toBe('https://svn/battery/jaro/run/observed/a.tsv')
    expect(resolveObservedUrl('https://x/a.tsv', run)).toBe('https://x/a.tsv')
  })

  it('skips comment lines', () => {
    const rows = parseObservedText('# source: RKI\nweek\tcases\n2025-W38\t28\n2025-W39\t41\n')
    expect(rows).toEqual([
      { week: '2025-W38', cases: 28 },
      { week: '2025-W39', cases: 41 },
    ])
  })

  it('scales weekly counts to 100k population', () => {
    const series = buildObservedSeries(
      { name: 'n', url: '', date: 'week', value: 'cases', unit: 'count', population: 200000, plots: [] },
      [
        { week: '2025-W39', cases: 41 },
        { week: '2025-W38', cases: 28 },
        { week: '2025-W40', cases: '' },
      ]
    )
    expect(series.x).toEqual(['2025-09-21', '2025-09-28'])
    expect(series.y).toEqual([14, 20.5])
    expect(series.axis).toBe('y')
  })

  it('sums daily values over complete 7-day windows', () => {
    const rows = Array.from({ length: 8 }, (_, i) => ({ date: `2025-10-0${i + 1}`, n: i + 1 }))
    const series = buildObservedSeries(
      { name: 'n', url: '', date: 'date', value: 'n', period: 'day', unit: 'per100k', plots: [] },
      rows
    )
    expect(series.x).toEqual(['2025-10-07', '2025-10-08'])
    expect(series.y).toEqual([28, 35])
  })

  it('puts concentrations on the secondary axis unscaled', () => {
    const series = buildObservedSeries(
      { name: 'n', url: '', date: 'date', value: 'v', unit: 'concentration', plots: [] },
      [{ date: '2025-10-01', v: 3.5e4 }]
    )
    expect(series.axis).toBe('y2')
    expect(series.y).toEqual([3.5e4])
  })

  it('rejects counts without population and unknown columns', () => {
    expect(() =>
      buildObservedSeries({ name: 'n', url: '', date: 'week', value: 'cases', plots: [] }, [])
    ).toThrow(/population/)
    expect(() =>
      buildObservedSeries(
        { name: 'n', url: '', date: 'week', value: 'x', unit: 'per100k', plots: [] },
        [{ week: '2025-W39', cases: 1 }]
      )
    ).toThrow(/no column 'x'/)
  })
})

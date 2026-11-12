import { vi } from 'vitest'
import {
  fileUrl,
  inspectRun,
  listRuns,
  ModelRun,
  outputPath,
  parseRunMetadata,
} from '@/util/runSources'

const base = 'https://doip.episerve.zib.de/doip/retrieve/Q123/output/'
const yaml =
  'viewerVersion: 2\ncity: Cologne\nreadme: notes.md\nzipFolder: summaries\ngraphStartDate: 2025-01-01\noptionGroups: []\n'
const run = (files: string[]): ModelRun => ({
  run_id: 'Q123',
  qid: 'Q123',
  model_name: 'episim',
  status: 'success',
  run_timestamp: '2026-11-12',
  input_files: [],
  output_files: files.map(p => base + p),
})
afterEach(() => vi.unstubAllGlobals())
describe('run sources', () => {
  it('keeps nested component paths and version queries on the same-origin gateway', () => {
    expect(fileUrl(base + 'summaries/0.zip?version=abc')).toBe(
      '/sources/doip/doip/retrieve/Q123/output/summaries/0.zip?version=abc'
    )
    expect(outputPath(base + 'summaries/0.zip')).toBe('summaries/0.zip')
    expect(() => fileUrl('https://example.org/file')).toThrow()
    expect(() => fileUrl('javascript:alert(1)')).toThrow()
  })
  it('keeps generic prediction runs available without attempting to load them as EpiSim', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    expect(await inspectRun(run(['predictions.tsv', 'run.log']))).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })
  it('rejects HTML, incomplete metadata and unsupported viewer versions', () => {
    expect(() => parseRunMetadata('<html>Not found</html>')).toThrow()
    expect(() => parseRunMetadata('city: Cologne')).toThrow()
    expect(() => parseRunMetadata(yaml.replace('viewerVersion: 2', 'viewerVersion: 7'))).toThrow()
  })
  it('connects a complete EpiSim package to the existing viewer', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, text: async () => yaml }))
    const result = await inspectRun(
      run(['metadata.yaml', '_info.txt', 'summaries/0.zip', 'chart-incidence.yaml'])
    )
    expect(result).toMatchObject({
      baseUrl: '/sources/doip/doip/retrieve/Q123/',
      runId: 'output',
      charts: ['chart-incidence.yaml'],
      yaml: { city: 'Cologne', viewerVersion: 2 },
    })
  })
  it('does not offer a viewer for incomplete or inaccessible packages', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, text: async () => yaml }))
    await expect(inspectRun(run(['metadata.yaml']))).rejects.toThrow('incomplete')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 403 }))
    await expect(inspectRun(run(['metadata.yaml']))).rejects.toThrow('403')
  })
  it('reports API errors instead of silently showing an empty catalog', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 502 }))
    await expect(listRuns()).rejects.toThrow('502')
  })
})

import YAML from 'yaml'
import { PUBLIC_SVN, RunYaml } from '@/Globals'

export const SVN_ROOT = PUBLIC_SVN + 'battery/jaro/'
export const API_ROOT = '/sources/episerve'
export interface ModelRun {
  run_id: string
  qid: string
  model_name: string
  status: string
  run_timestamp: string
  input_files: string[]
  output_files: string[]
}
export async function readJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Request failed (HTTP ${response.status}). Please try again.`)
  return response.json()
}
export async function listRuns(): Promise<ModelRun[]> {
  const data = await readJson<ModelRun[]>(API_ROOT + '/model-runs')
  if (!Array.isArray(data)) throw new Error('The source returned an invalid run list.')
  return data.sort((a, b) => b.run_timestamp.localeCompare(a.run_timestamp))
}
// Only known public gateways are mapped through the same-origin proxy.
export function fileUrl(url: string): string {
  const parsed = new URL(url)
  if (parsed.protocol !== 'https:') throw new Error('Unsupported file URL.')
  if (parsed.origin === 'https://doip.episerve.zib.de')
    return '/sources/doip' + parsed.pathname + parsed.search
  if (parsed.origin === 'https://data.episerve.zib.de')
    return '/sources/catalog' + parsed.pathname + parsed.search
  throw new Error('The file is hosted on an unsupported source.')
}
export function outputPath(url: string): string | null {
  try {
    const path = decodeURIComponent(new URL(url).pathname)
    const marker = '/output/'
    const index = path.indexOf(marker)
    return index < 0 ? null : path.slice(index + marker.length)
  } catch {
    return null
  }
}
export function parseRunMetadata(text: string): RunYaml {
  const value = YAML.parse(text)
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    !['city', 'zipFolder', 'graphStartDate', 'readme'].every(
      key => typeof value[key] === 'string'
    ) ||
    !Array.isArray(value.optionGroups) ||
    ![1, 2].includes(value.viewerVersion || 1)
  ) {
    throw new Error('This metadata is not supported by the EpiSim viewer.')
  }
  return value
}
export async function inspectRun(run: ModelRun) {
  const files = run.output_files || []
  const metadata = files.find(url => outputPath(url) === 'metadata.yaml')
  if (!metadata) return null
  const response = await fetch(fileUrl(metadata))
  if (!response.ok) throw new Error(`Cannot read metadata (HTTP ${response.status}).`)
  const yaml = parseRunMetadata(await response.text())
  const paths = files.map(outputPath).filter((p): p is string => p !== null)
  if (
    !paths.includes('_info.txt') ||
    !paths.some(p => p.startsWith(yaml.zipFolder.replace(/\/$/, '') + '/') && p.endsWith('.zip'))
  ) {
    throw new Error(
      'The EpiSim package is incomplete: _info.txt and scenario ZIP files are required.'
    )
  }
  const base = fileUrl(metadata).replace(/metadata\.yaml(?:\?.*)?$/, '')
  // Split at output so the existing viewers can keep joining base + runId + relative file.
  const split = base.lastIndexOf('/output/')
  return {
    yaml,
    baseUrl: base.slice(0, split + 1),
    runId: 'output',
    charts: paths.filter(p => /^chart[^/]*\.yaml$/.test(p)),
  }
}

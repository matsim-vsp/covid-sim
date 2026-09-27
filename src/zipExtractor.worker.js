import { expose } from 'threads/worker'
import ZipLoader from 'zip-loader'
import Papaparse from '@simwrapper/papaparse'

let _zipFile = null
// let _zipLoaderLookup: { [run: string]: Promise<any> } = {} // holds the ZipLoaders
let _zipLoaderLookup = {} // holds the ZipLoaders, by zip file URL
// URL of the zip requested last; an older request finishing later must not replace it
let _requestedZip = null

const extractor = {
  clear() {
    _zipFile = null
    _zipLoaderLookup = {}
    _requestedZip = null
  },
  async setZipFile(props) {
    const { BATTERY_URL, runId, zipFolder, whichZip } = props

    // keyed by the whole URL: runs of different cities share ids like '0'
    const filepath = `${BATTERY_URL}${runId}/${zipFolder}/${whichZip}.zip`
    _requestedZip = filepath

    // cached the zip already?
    if (filepath in _zipLoaderLookup) {
      console.log('### Using cache', filepath)
      _zipFile = _zipLoaderLookup[filepath]
      return
    }

    console.log('###', filepath)
    const response = await fetch(filepath)
    const blob = await response.blob()

    const instance = await ZipLoader.unzip(blob)
    _zipLoaderLookup[filepath] = instance
    if (_requestedZip === filepath) _zipFile = instance
  },
  extractFile(filename) {
    if (!_zipFile) return

    // console.log('### EXTRACTING', filename)
    let text = _zipFile.extractAsText(filename)
    const result = Papaparse.parse(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      delimitersToGuess: ['\t', ';', ',', ' '],
    })

    // console.log('### GOT RESULTS', result)
    return result
  },
  extractRawText(filename) {
    if (!_zipFile) return
    let text = _zipFile.extractAsText(filename)
    return text
  },
  hasFile(filename) {
    if (!_zipFile) return false
    return _zipFile.files.hasOwnProperty(filename)
  },
}

// export type ZipExtractorWorkerThing = typeof extractor
expose(extractor)

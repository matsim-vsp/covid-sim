import { expose } from 'threads/worker'
import ZipLoader from 'zip-loader'
import Papaparse from '@simwrapper/papaparse'

let _zipFile = null
// let _zipLoaderLookup: { [run: string]: Promise<any> } = {} // holds the ZipLoaders
let _zipLoaderLookup = {} // holds the ZipLoaders

const extractor = {
  clear() {
    _zipFile = null
    _zipLoaderLookup = {}
  },
  async setZipFile(props) {
    const { BATTERY_URL, runId, zipFolder, whichZip } = props

    // cached the zip already?
    if (whichZip in _zipLoaderLookup) {
      console.log('### Using cache', whichZip)
      _zipFile = _zipLoaderLookup[whichZip]
      return
    }

    const filepath = `${BATTERY_URL}${runId}/${zipFolder}/${whichZip}.zip`
    console.log('###', filepath)
    const response = await fetch(filepath)
    const blob = await response.blob()

    await ZipLoader.unzip(blob).then(instance => {
      _zipFile = instance
      // cache the zipfile:
      _zipLoaderLookup[runId] = _zipFile
    })
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

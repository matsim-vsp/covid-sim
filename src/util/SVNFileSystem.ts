interface DirectoryEntry {
  files: string[]
  dirs: string[]
}

class SVNFileSystem {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    if (!baseUrl.endsWith('/')) this.baseUrl += '/'

    console.log(this.baseUrl)
  }

  async getDirectory(scaryPath: string): Promise<DirectoryEntry> {
    // hostile user could put anything in the URL really...
    let path = this.baseUrl + scaryPath.replace(/^0-9a-zA-Z_\-\/:+/i, '')

    // don't download any files!
    if (!path.endsWith('/')) path += '/'

    // ok now we're safe
    console.log('fetching dir:', path)

    return await fetch(path)
      .then(response => response.text())
      .then(data => {
        return this.buildListFromHtml(data)
      })
      .catch(error => {
        return { dirs: [], files: [] }
      })
  }

  async getFile(scaryPath: string): Promise<string> {
    // hostile user could put anything in the URL really...
    let path = this.baseUrl + scaryPath.replace(/^0-9a-zA-Z_\-\/:+/i, '')

    // don't download any files!
    if (!path.endsWith('/')) path += '/'

    // ok now we're safe
    // console.log('fetching file:', path)

    return await fetch(path).then(response => {
      return response.text()
    })
    // no catch, because we want errors to propagate up
  }

  private buildListFromHtml(data: string): DirectoryEntry {
    const regex = /"(.*?)"/
    const dirs = []
    const files = []

    const lines = data.split('\n')

    for (const line of lines) {
      const href = line.indexOf('<li><a href="')
      if (href < 0) continue
      const entry = line.match(regex)
      if (!entry) continue

      // got one!
      const name = entry[1] // regex returns first match in [1]

      if (name === '../') continue

      if (name.endsWith('/')) dirs.push(name.substring(0, name.length - 1))
      else files.push(name)
    }

    return { dirs, files }
  }
}

export default SVNFileSystem

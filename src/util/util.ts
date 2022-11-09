async function updateQueryHiddenLines(props: {
  parent: any
  abbreviation: string
  dataLines: any[]
  unselectedLines: any[]
}) {
  const { parent, abbreviation, dataLines, unselectedLines } = props

  for (let i = 0; i < dataLines.length; i++) {
    if (dataLines[i].visible == 'legendonly' && !unselectedLines.includes(dataLines[i].name)) {
      unselectedLines.push(dataLines[i].name)
    } else if (
      dataLines[i].visible != 'legendonly' &&
      unselectedLines.includes(dataLines[i].name)
    ) {
      unselectedLines.splice(unselectedLines.indexOf(dataLines[i].name))
    }
  }

  const params = Object.assign({}, parent.$route.query)

  if (unselectedLines.length) {
    params['plot-' + abbreviation] = unselectedLines
  } else {
    delete params['plot-' + abbreviation]
  }

  console.log('PARAMS', params)
  try {
    await parent.$router.replace({ query: params })
  } catch (e) {
    /** this is OK */
  }
}

export default { updateQueryHiddenLines }

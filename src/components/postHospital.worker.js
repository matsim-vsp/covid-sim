import { expose } from 'threads/worker'
import { PUBLIC_SVN } from '@/Globals'
import Papaparse from 'papaparse'

// configuration ----------------------------

const observedHospitalizationConfig = {
  cologne: {
    svnPath: 'original-data/hospital-cases/cologne/KoelnAllgemeinpatienten.csv',
    csvCasesColumn: 'allgemeinpatienten',
    legendText: 'Reported: Hospitalizations (City)',
  },
}

const diviIncidenceNRWUrl = PUBLIC_SVN + 'original-data/hospital-cases/cologne/DiviIncidenceNRW.csv'
const originalDataUrl = PUBLIC_SVN + 'original-data/Fallzahlen/'

const cityObservedHospitalizationFiles = {
  cologne: originalDataUrl + 'Cologne/cologne-hospital.csv',
}

const bundeslandCSV = require('@/assets/rki-deutschland-hospitalization.csv').default
const bundeslandIncidenceRateLookup = {
  berlin: { name: 'Berlin' },
  cologne: { name: 'Nordrhein-Westfalen' },
}

// -------------------------------------------
// local variables

let factor100k = 1

let observedData = []
let bundeslandCsvData = []
let diviIncidenceNRWData = []

async function fetchInitialData() {
  if (!bundeslandCsvData.length) {
    bundeslandCsvData = Papaparse.parse(bundeslandCSV, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      comments: '#',
    }).data
  }

  if (!diviIncidenceNRWData.length) {
    const response = await fetch(diviIncidenceNRWUrl)
    const text = await response.text()
    diviIncidenceNRWData = Papaparse.parse(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      comments: '#',
    }).data
  }
}

async function buildDataLines(props) {
  console.log(1, 'HERE')
  const lines = await calculateValues(props)
  console.log(99, lines)
  return lines
}

async function calculateValues(props) {
  // these vars must be passed in:
  const { data, totalPopulation, city, intakesHosp } = props

  const dataLines = []

  await fetchInitialData()

  console.log(2)

  const date = []
  const intakesHospOmicron = []
  const intakesICUOmicron = []
  const occupancyHospOmicron = []
  const occupancyICUOmicron = []
  const intakesHospDelta = []
  const intakesICUDelta = []
  const occupancyHospDelta = []
  const occupancyICUDelta = []

  for (let i = 0; i < data.length; i++) {
    if (data[i].measurement != null) {
      const measurement = data[i].measurement.trim()
      const severity = data[i].severity.trim()
      const dateTemp = data[i].date.trim()
      const n = data[i].n

      if (severity == 'Omicron') {
        if (measurement == 'intakesHosp') {
          date.push(dateTemp)
          intakesHospOmicron.push(n)
        }
        if (measurement == 'intakesICU') {
          intakesICUOmicron.push(n)
        }
        if (measurement == 'occupancyHosp') {
          occupancyHospOmicron.push(n)
        }
        if (measurement == 'occupancyICU') {
          occupancyICUOmicron.push(n)
        }
      } else {
        if (measurement == 'intakesHosp') {
          intakesHospDelta.push(n)
        }
        if (measurement == 'intakesICU') {
          intakesICUDelta.push(n)
        }
        if (measurement == 'occupancyHosp') {
          occupancyHospDelta.push(n)
        }
        if (measurement == 'occupancyICU') {
          occupancyICUDelta.push(n)
        }
      }
    }
  }

  if (!intakesHosp) {
    dataLines.push(
      {
        name: 'occupancyHosp-Delta',
        x: date,
        y: occupancyHospDelta,
        line: { width: 1 },
      },
      {
        name: 'occupancyHosp-Omicron',
        x: date,
        y: occupancyHospOmicron,
        line: { width: 1 },
      },
      {
        name: 'occupancyICU-Delta',
        x: date,
        y: occupancyICUDelta,
        line: { width: 1 },
      },
      {
        name: 'occupancyICU-Omicron',
        x: date,
        y: occupancyICUOmicron,
        line: { width: 1 },
      }
    )
  } else {
    dataLines.push(
      {
        name: 'intakesHosp-Delta',
        x: date,
        y: intakesHospDelta,
        line: { width: 1 },
      },
      {
        name: 'intakesHosp-Omicron',
        x: date,
        y: intakesHospOmicron,
        line: { width: 1 },
      },
      {
        name: 'intakesICU-Delta',
        x: date,
        y: intakesICUDelta,
        line: { width: 1 },
      },
      {
        name: 'intakesICU-Omicron',
        x: date,
        y: intakesICUOmicron,
        line: { width: 1 },
      }
    )
  }

  if (!intakesHosp) {
    // Rate
    await addReportedDataRate(dataLines, totalPopulation, city)
  } else {
    // New Cases
    await addReportedDataNewCases(dataLines, city)
  }

  return dataLines
}

const cacheReportedDataRate = {}
const cacheReportedDataNewCases = {}

async function addReportedDataRate(dataLines, totalPopulation, city) {
  factor100k = totalPopulation / 100000.0

  if (observedHospitalizationConfig[city]) {
    const config = observedHospitalizationConfig[city]

    if (!(city in cacheReportedDataRate)) {
      const url = PUBLIC_SVN + config.svnPath
      console.log(url)
      const rawData = await fetch(url).then(async raw => await raw.text())
      const csvData = Papaparse.parse(rawData, {
        header: true,
        dynamicTyping: false,
        skipEmptyLines: true,
      }).data
      cacheReportedDataRate[city] = csvData
    }

    const csvData = cacheReportedDataRate[city]
    dataLines.push({
      name: config.legendText,
      x: csvData.map(row => row.date.split('T')[0]),
      y: csvData.map(row => parseFloat(row[config.csvCasesColumn]) / factor100k),
      line: { width: 1 },
    })
  }
}

async function addReportedDataNewCases(dataLines, city) {
  // Observed Hospitalization Case Rate
  observedData = []

  try {
    if (cityObservedHospitalizationFiles[city]) {
      if (!(city in cacheReportedDataNewCases)) {
        const response = await fetch(cityObservedHospitalizationFiles[city])
        const text = await response.text()
        const hospitalData = Papaparse.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          comments: '#',
        }).data
        cacheReportedDataNewCases[city] = hospitalData
      }

      const hospitalData = cacheReportedDataNewCases[city]
      if (hospitalData.length) {
        observedData = hospitalData

        for (let i = 0; i < dataLines.length; i++) {
          if (dataLines[i].name == 'Observed Hospitalization Case Rate') {
            dataLines.splice(i, 1)
          }
        }

        if (dataLines.length)
          dataLines.push({
            name: 'Observed Hospitalization Case Rate',
            x: observedData.map(row => row.date),
            y: observedData.map(row => row.realHospitalizationRate),
            //type: 'scatter',
            //mode: 'markers',
            line: { width: 1 },
          })
      }
    }
  } catch (e) {
    console.error(e)
  }

  // only add Bundesland data if we are looking at data for a city with a Bundesland
  if (!bundeslandIncidenceRateLookup[city]) return

  const region = bundeslandIncidenceRateLookup[city]
  // console.log(region)

  const allAges = bundeslandCsvData.filter(row => row['Altersgruppe'] === '00+')
  const regionData = allAges.filter(row => row['Bundesland'] === region.name)

  for (let i = 0; i < dataLines.length; i++) {
    if (dataLines[i].name == 'Observed: ' + region.name + ' (RKI)') {
      dataLines.splice(i, 1)
    }
    if (dataLines[i].name == 'Adjusted: ' + region.name + ' (RKI)') {
      dataLines.splice(i, 1)
    }
  }

  dataLines.push({
    name: 'Observed: ' + region.name + ' (RKI)',
    x: regionData.map(row => row['Datum']),
    y: regionData.map(
      row =>
        row['aktualisierte_7T_Hospitalisierung_Inzidenz'] || row['7T_Hospitalisierung_Inzidenz']
    ),
    //type: 'scatter',
    //marker: { size: 4, color: '#4c6' },
    //line: { width: 2, dash: 'dot' },
    line: { width: 1 },
  })

  dataLines.push({
    name: 'Adjusted: ' + region.name + ' (RKI)',
    x: regionData.map(row => row['Datum']),
    y: regionData.map(row => row['PS_adjustierte_7T_Hospitalisierung_Inzidenz']),
    //type: 'scatter',
    //marker: { color: '#4c6' },
    line: { width: 1 },
  })

  // DIVI
  try {
    // Workaround for doubled data; Not a good bugfix but it works
    // The 'Observed : Nordrhein-Westfalen (DIVI)' was present three
    // times on the Cologne Hospitalization New Cases Plot
    let diviExsists = false
    dataLines.forEach(e => {
      if (e.name == 'Observed : Nordrhein-Westfalen (DIVI)') {
        diviExsists = true
      }
    })

    const incidenceNRW = diviIncidenceNRWData

    if (incidenceNRW.length) {
      if (dataLines.length && !diviExsists)
        dataLines.push({
          name: 'Observed : Nordrhein-Westfalen (DIVI)',
          x: incidenceNRW.map(row => row.Date),
          y: incidenceNRW.map(row => row.DIVIIncidence),
          //type: 'scatter',
          //marker: { size: 4, color: 'brown' },
          //line: { width: 2, dash: 'dot' },
          line: { width: 1 },
        })
    }
  } catch (e) {
    console.error(e)
  }
}

const postProcessor = { buildDataLines }
expose(postProcessor)

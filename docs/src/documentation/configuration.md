# Configuration

Each run has a `config.yaml` file. In this file settings can be made. The following settings are possible:

## YAML File

| name | required | data type | description |
|------|-----------|----------|-------------|
| viewerVersion | false | number | There are several versions of covid-sim. The current version is 2. Possible versions are: 1 and 2. |
| city | true | string | Covid-sim can map data from different cities. Possible are: berlin and cologne. |
| info | true | string | Specifies the name of the file in which the run IDs are assigned to the settings. |
| readme | true | string | For the description to be displayed above the plots, the name of the Markdown file can be specified, which is located in the same folder as the YAML file. |
| zipFolder | true | string | For the data of the runs, the folder with the results can be specified here, which is located in the same folder as the YAML file. |
| timestamp | true | string | Specifies the date in the format `YYYY-MM-DD` on which the run was set up. |
| offset | false| number[] | desc... |
| startDate | false | string | Specifies the start date in the format `YYYY-MM-DD` when the run starts. One of the two values `startDate` and `defaultStartDate` must be set. |
| endDate | false | string | Specifies the start date in the format `YYYY-MM-DD` when the run ends. |
| defaultStartDate | false | string | One of the two values `startDate` and `defaultStartDate` must be set. |
| startDates | false | string[] | Are required if no `offset` has been specified. |
| ignoredPlots | false | string[] | Plots can be hidden for specific runs. For this purpose, the short name of the plot must be specified at this point. For the respective short names see: [Plots](plots.md#plots). |
| graphStartDate | true | string | Specifies the date in the format `YYYY-MM-DD` when the plots start. |
| heatMapMaxValue | false | number | So that the results of different runs can be compared with the heatmap. A maximum value must be set, which can be adjusted here. |
| rValueDate | false | string | The date for the displayed R-value can be set in the format 'YYYY-MM-DD'. The default date is: `2020-10-15`. |
| optionGroups | true | [optionGroups](#optiongroups)[] | desc... |
  
### optionGroups

| name | required | data type | description |
|------|-----------|----------|-------------|
| day | false | number | desc... |
| heading | true | string | desc... |
| subheading | false | string | desc... |
| measures | true | [measures](#measures)[] | desc... |
      
### measures

| name | required | data type | description |
|------|-----------|----------|-------------|
| measure | true | string | desc... |
| title | true | string | desc... |
| order | false | string | desc... |
| options | false | number[] | desc... |
| asPercent | false | boolean | desc... |

### Example
This is an example YAML file which belongs to this [run](https://covid-sim.info/cologne/2022-11-16/3-variants).

```yaml
---
readme: notes.md
zip: summaries.zip
info: _info.txt
zipFolder: summaries
timestamp: 2022-11-18
viewerVersion: 2
city: cologne
runName: calibration
defaultStartDate: 2020-02-25
graphStartDate: 2022-08-01
endDate: 2024-09-30
startDates:
- 2020-02-25
optionGroups:
- day: -1
  heading: ""
  subheading: ""
  measures:
  - title: Vac Camp
    measure: vacCamp
  - title: Strain A
    measure: StrainA
  - title: Strain A Date
    measure: strainADate
  - title: Esc
    measure: esc
  - title: Esc L
    measure: escL
  - title: Ci Corr
    measure: ciCorr
  - title: Days
    measure: days
  - title: Strain Rnd
    measure: strainRnd
  - title: Line B
    measure: lineB
  - title: Iga
    measure: iga
  - title: Seasonal
    measure: seasonal
``` 
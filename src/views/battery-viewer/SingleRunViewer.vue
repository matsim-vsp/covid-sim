<template lang="pug">
#single-run-viewer
  .left-content
    .side-menu
      .menu-categorie(v-for="(categorie, index) in sideMenuCategories")
        .categorie-header(@click="updateSideMenu(categorie)")
          i.fa.fa-arrow-down.menu-arrow(v-if="index == activeSideMenu" )
          i.fa.fa-arrow-right.menu-arrow(v-else )
          h6.menu-header.title {{categorie}}
        .categorie-content(v-show="categorie == 'Plots' && activeSideMenu == 1")
          .scrollable
            .allPlots(v-for="chartKey in Object.keys(vegaChartData)" :key="'top' + chartKey" v-if="vegaChartData[chartKey].yaml.showAbove === true")
              .plot-menu(@click="showVegaPlots(chartKey)")
                input.plot-checkbox(:checked="vegaChartData[chartKey].isVisible" type="checkbox")
                p {{vegaChartData[chartKey].yaml.title}}
            .allPlots(v-for="(plot, index) in allPlotsCheckIsUsedInThisRun()" :key="index")
              .plot-menu(v-if="plot.usedInThisRun" @click="showPlotMenu(plot.index)")
                input.plot-checkbox(:checked="plot.active" type="checkbox")
                p.plot-name {{plot.name}}
            .allPlots(v-for="chartKey in Object.keys(vegaChartData)" :key="chartKey" v-if="vegaChartData[chartKey].yaml.showAbove === false")
              .plot-menu(@click="showVegaPlots(chartKey)")
                input.plot-checkbox(:checked="vegaChartData[chartKey].isVisible" type="checkbox")
                p(@click="showVegaPlots(chartKey)") {{vegaChartData[chartKey].yaml.title}}

          .select-all-plots
            button.button.is-small.menu-button(@click="showPlotMenu('allActive')") Select All
            button.button.is-small.menu-button(@click="showPlotMenu('allInactive')") Unselect All
        .categorie-content.scrollable(v-show="categorie == 'Select Scenario' && activeSideMenu == 0")
          .categorie-group(v-for="group in runYaml.optionGroups" :key="group.heading + group.day")
            .g1(v-if="hasMultipleOptions(group)")
              h6.title {{ getGroupTitle(group) }}

              p.subhead(v-if="group.subheading") {{ group.subheading }}

              .measure(v-for="m in group.measures" :key="m.measure")
                .measure-buttons(v-if="measureOptions[m.measure].length > 1")
                  p {{ m.title }}
                  button-group(:measure="m" :options="measureOptions[m.measure]" @changed="sliderChanged")

          .left-padding
            h5.cumulative Cumulative Infected by
              br
              | {{ endDate }}:
            p.infected {{ prettyInfected }}

            h5.cumulative R-Value on:
            input#reditor.input.r-input(size=9 v-model="summaryRValueDate")
            p.infected {{ summaryRValue }}

            .single-value-options(v-if="singleValueOptionKeys.length")
              h5 Simulation Parameters:
              table
                tr(v-for="measure in singleValueOptionKeys" :key="measure")
                  td(style="text-align: right; padding-right: 0.4rem") {{measure}}
                  td: b(style="color: #596") {{ singleValueOptions[measure]}}

  .right-content
    .page-section.content
      .readme(v-html="topNotes")

    .page-section.preamble(:style="{backgroundColor: 'white'}")
      h3.select-scenario &nbsp;

    .page-section.base-choice(v-if="city && hasBaseRun")
      .button-choices.buttons.has-addons
        button.button.is-small(
          :style="{marginRight: '0.5rem'}"
          :class="{'is-link': !isBase, 'is-selected': !isBase}"
          :key="'do-something'" @click='setBase(false)') Alternatives
        button.button.is-small(
          :class="{'is-link': isBase, 'is-selected': isBase}"
          :key="'base'" @click='setBase(true)') What would have happened without restrictions

    .page-section.selections-and-charts
      .right-side(:class="{'wide-mode': $store.state.isWideMode}")
        p.width-selection
          a(:class="{'active-view-mode': !$store.state.isWideMode}" @click="setWideMode(false)") Narrow
          a(:class="{'active-view-mode': $store.state.isWideMode}" @click="setWideMode(true)") Wide

        //- ------- ACTIVITY LEVELS
        .linear-plot.activity(v-if="showActivityLevels && allPlots[0].active")
          h5 {{allPlots[0].name}}
          p 0-100% of normal
          .plotarea.activities
            activity-levels-plot.plotsize(:city="city" :battery="runId"
              :currentRun="currentRun" :startDate="startDate" :endDate="endDate" :plusminus="plusminus"
              :zipContent="zipLoader")
              //- @missing="showActivityLevels = false")

        //- ------ Vega charts with top=true -----------
        .top-vega-plots(v-for="chartKey in Object.keys(vegaChartData)" :key="chartKey")
          .linear-plot.top-vega-plot(v-if="vegaChartData[chartKey].yaml.showAbove === true && vegaChartData[chartKey].isVisible")
            vega-lite-chart.plotsize(
              :baseUrl="BATTERY_URL"
              :runId="runId"
              :configFile="chartKey"
              :logScale="logScale"
              :yamlDef="vegaChartData[chartKey].yaml"
              :data="vegaChartData[chartKey].data"
            )

        //- ----- SCALE AND SHIFT BUTTONS -----
        .plot-options
          .scale-options
            b Scale
            .variation-choices.buttons.has-addons
              button.button.is-small(
                :class="{'is-link': !logScale, 'is-selected': !logScale}"
                @click="logScale = false") Linear
              button.button.is-small(
                :class="{'is-link': logScale, 'is-selected': logScale}"
                @click="logScale = true") Log

          .variation(v-if="offset.length > 1")
            b Shift Start Date
            .variation-choices.buttons.has-addons( style="margin-left: auto;")
              button.button.is-small(v-for="offset in offset" :key="offset"
                :class="{'is-link': plusminus === offset, 'is-selected': plusminus === offset}"
                @click="setPlusMinus(offset)") {{ strOffset(offset)}}

        .all-plots
          //- ---------- Disease Import -------
          .linear-plot(v-if="diseaseData.length > 0 && allPlots[1].active")
            h5 {{ cityCap }} {{allPlots[1].name}}
              button.button.is-small.hider(@click="toggleShowPlot(1)") ..

            .hideIt(v-show="allPlots[1].showPlot")
              //- p mRNA Vaccines
              .plotarea.compact
                p.plotsize(v-if="!isZipLoaded") Loading data...
                p.plotsize(v-if="isZipLoaded && isDataMissing") Results not found
                disease-import(v-else
                  :startDate="startDate"
                  :endDate="endDate"
                  :logScale="logScale"
                  :data="diseaseData"
                )

          //- //- ---------- Post Hospital -------
          .linear-plot(v-if="postHospital.length > 0 && allPlots[2].active")
            h5 {{ cityCap }} {{allPlots[2].name}}
              button.button.is-small.hider(@click="toggleShowPlot(2)") ..

            .hideIt(v-show="allPlots[2].showPlot")
              //- p mRNA Vaccines
              .plotarea.compact
                p.plotsize(v-if="!isZipLoaded") Loading data...
                p.plotsize(v-if="isZipLoaded && isDataMissing") Results not found
                post-hospital(v-else
                  :startDate="startDate"
                  :endDate="endDate"
                  :logScale="logScale"
                  :data="postHospital"
                  :intakesHosp="true"
                )

          //- //- ---------- Post Hospital -------
          .linear-plot(v-if="postHospital.length > 0 && allPlots[3].active")
            h5 {{ cityCap }} {{allPlots[3].name}}
              button.button.is-small.hider(@click="toggleShowPlot(3)") ..

            .hideIt(v-show="allPlots[3].showPlot")
              //- p mRNA Vaccines
              .plotarea.compact
                p.plotsize(v-if="!isZipLoaded") Loading data...
                p.plotsize(v-if="isZipLoaded && isDataMissing") Results not found
                post-hospital(v-else
                  :startDate="startDate"
                  :endDate="endDate"
                  :logScale="logScale"
                  :data="postHospital"
                  :intakesHosp="false"
                )

          //- ---------- CASES COMPARISION -------
          .linear-plot(v-if="allPlots[4].active")
            h5 {{ cityCap }} {{allPlots[4].name}}
              button.button.is-small.hider(@click="toggleShowPlot(4)") ..

            .hideIt(v-show="allPlots[4].showPlot")
              p New persons showing symptoms (model) vs. new cases (reality)
              .plotarea.tall
                p.plotsize(v-if="!isZipLoaded") Loading data...
                p.plotsize(v-if="isZipLoaded && isDataMissing") Results not found
                weekly-infections-plot.plotsize(v-else :data="data"  :endDate="endDate"
                :observed="observedCases"
                :rkiDetectionData="rkiDetectionRateData"
                :logScale="logScale"
                :unreportedIncidence="unreportedIncidence"
                :unreportedIncidenceNRW="unreportedIncidenceNRW")

          //- ---------- VIRUS STRAINS -------
          .linear-plot(v-if="showVirusStrainsPlot && mutationValues.length > 0  && allPlots[5].active")
            h5 {{ cityCap }} {{allPlots[5].name}}
              button.button.is-small.hider(@click="toggleShowPlot(5)") ..

            .hideIt(v-show="allPlots[5].showPlot")
              p Simulated number of infections (whole simulation region) and percentage, by strain
              .plotarea(:style="{height: '42rem'}")
                p.plotsize(v-if="!isZipLoaded") Loading data...
                p.plotsize(v-if="isZipLoaded && isDataMissing") Results not found
                mutations-plot(v-else
                  :data="data"
                  :endDate="endDate"
                  :logScale="logScale"
                  :strainValues="mutationValues"
                  :city="city"
                )

          //- ---------- R-VALUES -------
          .linear-plot(v-if="allPlots[6].active")
            h5 {{ cityCap }} {{allPlots[6].name}}
              button.button.is-small.hider(@click="toggleShowPlot(6)") ..

            .hideIt(v-show="allPlots[6].showPlot")
              p {{ rValueMethodDescription }}
              .plotarea.compact
                p.plotsize(v-if="!isZipLoaded") Loading data...
                p.plotsize(v-if="isZipLoaded && isDataMissing") Results not found
                r-value-plot.plotsize(v-else
                  :data="data"
                  :endDate="endDate"
                  :logScale="false"
                  :rValues="rValues"
                  :rValueDate="summaryRValueDate"
                  @avgR="gotNewSummaryRValue"
                  @method="switchRMethod")

          //- ---------- R VALUES 2 -------
          .linear-plot(v-if="hasRValuePurposes  && allPlots[7].active")
            h5 {{ cityCap }} {{allPlots[7].name}}
              button.button.is-small.hider(@click="toggleShowPlot(7)") ..

            .hideIt(v-show="allPlots[7].showPlot")
              p {{ rValueMethodDescription }}
              .plotarea.compact
                p.plotsize(v-if="!isZipLoaded") Loading data...
                p.plotsize(v-if="isZipLoaded && isDataMissing") Results not found
                r-value-two.plotsize(v-else
                  :data="data"
                  :endDate="endDate"
                  :logScale="false"
                  :rValues="rValues"
                  @method="switchRMethod")

          //- ---------- INFECTIONS BY ACTIVITY TYPE ---------
          .linear-plot(v-if="infectionsByActivityType.length > 0  && allPlots[8].active")
            h5 {{ cityCap }} {{allPlots[8].name}}
              button.button.is-small.hider(@click="toggleShowPlot(8)") ..
            .hideIt(v-show="allPlots[8].showPlot")
              p 7 day average
              .plotarea(:style="{height: '28rem'}")
                p.plotsize(v-if="!isZipLoaded") Loading data...
                p.plotsize(v-if="isZipLoaded && isDataMissing") Results not found
                infections-by-activity-type(v-else
                  :endDate="endDate"
                  :logScale="logScale"
                  :values="infectionsByActivityType"
                )

          //- ---------- VACCINE EFFECTIVENESS -------
          .linear-plot(v-if="showVaccineEffectivenessFields.length && allPlots[9].active")
            h5 {{ cityCap }} {{allPlots[9].name}}
              button.button.is-small.hider(@click="toggleShowPlot(9)") ..

            .hideIt(v-show="allPlots[9].showPlot")
              p mRNA Vaccines
              .plotarea.compact
                p.plotsize(v-if="!isZipLoaded") Loading data...
                p.plotsize(v-if="isZipLoaded && isDataMissing") Results not found
                vaccine-effectiveness-plot(v-else
                  :startDate="startDate"
                  :endDate="endDate"
                  :logScale="false"
                  :vaccineEffectivenessData="vaccineEffectivenessData"
                  :vaccineEffectivenessFields="showVaccineEffectivenessFields"
                  vaccineType="mRNA"
                )

            .hideIt(v-show="allPlots[9].showPlot")
              p Vector Vaccines
              .plotarea.compact
                p.plotsize(v-if="!isZipLoaded") Loading data...
                p.plotsize(v-if="isZipLoaded && isDataMissing") Results not found
                vaccine-effectiveness-plot.plotsize(v-else
                  :startDate="startDate"
                  :endDate="endDate"
                  :logScale="false"
                  :vaccineEffectivenessData="vaccineEffectivenessData"
                  :vaccineEffectivenessFields="showVaccineEffectivenessFields"
                  vaccineType="vector"
                )

          //- ---------- VACCINE EFFECTIVENESS VS STRAIN -------
          .linear-plot(v-if="showVaccineEffectivenessVsStrainFields.length && allPlots[10].active")
            h5 {{ cityCap }} {{allPlots[10].name}}
              button.button.is-small.hider(@click="toggleShowPlot(10)") ..

            .hideIt(v-show="allPlots[10].showPlot")
              //- p mRNA Vaccines
              .plotarea.compact
                p.plotsize(v-if="!isZipLoaded") Loading data...
                p.plotsize(v-if="isZipLoaded && isDataMissing") Results not found
                vaccine-effectiveness-vs-strain(v-else
                  :startDate="startDate"
                  :endDate="endDate"
                  :logScale="false"
                  :vaccineEffectivenessData="vaccineEffectivenessVsStrainData"
                  :vaccineEffectivenessFields="showVaccineEffectivenessVsStrainFields"
                )

          //- ---------- VACCINATED / UNVACCINATED -------
          .linear-plot(v-if="showIncidenceComp && allPlots[11].active")
            h5 {{ cityCap }} {{allPlots[11].name}}
              button.button.is-small.hider(@click="toggleShowPlot(11)") ..

            .hideIt(v-show="allPlots[11].showPlot")
              //p New persons showing symptoms (model) vs. new cases (reality)
              .plotarea.tall
                p.plotsize(v-if="!isZipLoaded") Loading data...
                p.plotsize(v-if="isZipLoaded && isDataMissing") Results not found
                weekly-infection-by-vaccination.plotsize(v-else :data="data"  :endDate="endDate"
                :observed="observedCases"
                :rkiDetectionData="rkiDetectionRateData"
                :logScale="logScale")

          //- ---------- VACCINATION / BOOSTER RATES -------
          .linear-plot(v-if="showIncidenceComp  && allPlots[12].active")
            h5 {{ cityCap }} {{allPlots[12].name}}
              button.button.is-small.hider(@click="toggleShowPlot(12)") ..

            .hideIt(v-show="allPlots[12].showPlot")
              //p New persons showing symptoms (model) vs. new cases (reality)
              .plotarea.compact
                p.plotsize(v-if="!isZipLoaded") Loading data...
                p.plotsize(v-if="isZipLoaded && isDataMissing") Results not found
                vaccination-rates.plotsize(v-else :data="data"  :endDate="endDate"
                :observed="observedCases"
                :rkiDetectionData="rkiDetectionRateData"
                :logScale="logScale")

          //- ---------- VACCINATION PER TYPE -------
          .linear-plot(v-if="showIncidenceComp && vaccinationPerType.length > 0  && allPlots[13].active")
            h5 {{ cityCap }} {{allPlots[13].name}}
              button.button.is-small.hider(@click="toggleShowPlot(13)") ..

            .hideIt(v-show="allPlots[13].showPlot")
              p 7 day average
              //p New persons showing symptoms (model) vs. new cases (reality)
              .plotarea.compact
                p.plotsize(v-if="!isZipLoaded") Loading data...
                p.plotsize(v-if="isZipLoaded && isDataMissing") Results not found
                vaccination-per-type.plotsize(v-else :endDate="endDate"
                :logScale="logScale"
                :vaccinations="vaccinationPerType")

          //- ---------- ANTIBODIES -------
          .linear-plot(v-if="showIncidenceComp && antibodies.length > 0  && allPlots[14].active")
            h5 {{ cityCap }} {{allPlots[14].name}}
              button.button.is-small.hider(@click="toggleShowPlot(14)") ..

            .hideIt(v-show="allPlots[14].showPlot")
              //p 7 day average
              //p New persons showing symptoms (model) vs. new cases (reality)
              .plotarea.compact
                p.plotsize(v-if="!isZipLoaded") Loading data...
                p.plotsize(v-if="isZipLoaded && isDataMissing") Results not found
                antibodies.plotsize(v-else :endDate="endDate"
                :logScale="logScale"
                :antibodies="antibodies")

          //- ---------- HOSPITALIZATION 7-DAY MOVING NEW CASES -------
          .linear-plot(v-if="allPlots[15].active")
            h5 {{ cityCap }} {{allPlots[15].name}}
              button.button.is-small.hider(@click="toggleShowPlot(15)") ..

            .hideIt(v-show="allPlots[15].showPlot")
              p 7-day moving average
              .plotarea.tall
                p.plotsize(v-if="!isZipLoaded") Loading data...
                p.plotsize(v-if="isZipLoaded && isDataMissing") Results not found
                hospitalization-7-day-new-cases-plot.plotsize(v-else
                :data="data"
                :endDate="endDate"
                :city="city"
                :logScale="logScale"
                )

          //- ---------- HOSPITALIZATION RATES
          .linear-plot(v-if="city !== 'heinsberg'  && allPlots[16].active")
            h5 {{ cityCap }} {{allPlots[16].name}}
              button.button.is-small.hider(@click="toggleShowPlot(16)") ..

            .hideIt(v-show="allPlots[16].showPlot")
              p {{ this.logScale ? 'Log scale' : 'Linear scale' }}
              .plotarea.tall
                p.plotsize(v-if="!isZipLoaded") Loading data...
                p.plotsize(v-if="isZipLoaded && isDataMissing") Results not found
                hospitalization-plot.plotsize(v-else
                  :data="hospitalData" :logScale="logScale" :city="city"
                  :diviData="diviData" :endDate="endDate" )

          //- ---------- CASES COMPARISION BY VACCINATION -------
          .linear-plot(v-if="showIncidenceComp  && allPlots[17].active")
            h5 {{ cityCap }} {{allPlots[17].name}}
              button.button.is-small.hider(@click="toggleShowPlot(17)") ..

            .hideIt(v-show="allPlots[17].showPlot")
              //p New persons showing symptoms (model) vs. new cases (reality)
              .plotarea.tall
                p.plotsize(v-if="!isZipLoaded") Loading data...
                p.plotsize(v-if="isZipLoaded && isDataMissing") Results not found
                hospitalization-vaccination-comparison.plotsize(v-else :data="data"  :endDate="endDate"
                :observed="observedCases"
                :rkiDetectionData="rkiDetectionRateData"
                :logScale="logScale")

          //- ---------- HEALTH OUTCOMES ------
          .linear-plot(v-if="allPlots[18].active")
            h5 {{ cityCap }} {{allPlots[18].name}}
              button.button.is-small.hider(@click="toggleShowPlot(18)") ..

            .hideIt(v-show="allPlots[18].showPlot")
              p {{ this.logScale ? 'Log scale' : 'Linear scale' }}
              .plotarea
                p.plotsize(v-if="!isZipLoaded") Loading data...
                p.plotsize(v-if="isZipLoaded && isDataMissing") Results not found
                vue-plotly.plotsize(v-else
                  :data="dataHealth" :layout="layout" :options="options")

          //- ---------- AGE GROUP BLOCK CHART ------
          .linear-plot(v-if="showByAgePlot && incidenceHeatMapData && allPlots[19].active")
            h5 {{ cityCap }} {{allPlots[19].name}}
              button.button.is-small.hider(@click="toggleShowPlot(19)") ..

            .hideIt(v-show="allPlots[19].showPlot")
              .plotarea(style="grid-template-rows: 18rem")
                p.plotsize(v-if="!isZipLoaded") Loading data...
                p.plotsize(v-if="isZipLoaded && isDataMissing") Results not found
                heat-map.plotsize(v-else
                  :endDate="endDate"
                  :data="incidenceHeatMapData"
                  :heatMapMaxValue="runYaml.heatMapMaxValue"
                )

          //- ---------- AGE GROUP LINE CHART ------
          .linear-plot(v-if="showByAgePlot && incidenceHeatMapData  && allPlots[20].active")
            h5 {{ cityCap }} {{allPlots[20].name}}
              button.button.is-small.hider(@click="toggleShowPlot(20)") ..

            .hideIt(v-show="allPlots[20].showPlot")
              .plotarea(style="grid-template-rows: 18rem")
                p.plotsize(v-if="!isZipLoaded") Loading data...
                p.plotsize(v-if="isZipLoaded && isDataMissing") Results not found
                age-group-line-chart.plotsize(v-else
                  :endDate="endDate"
                  :data="incidenceHeatMapData"
                  :logScale="logScale")

          //- ---------- LEISURE OUTDOOR FRACTION ------
          .linear-plot(v-if="leisurOutdoorFractionData.length && allPlots[21].active")
            h5 {{ cityCap }} {{allPlots[21].name}}
              button.button.is-small.hider(@click="toggleShowPlot(21)") ..

            .hideIt(v-show="allPlots[21].showPlot")
              .plotarea(style="grid-template-rows: 18rem")
                p.plotsize(v-if="!isZipLoaded") Loading data...
                p.plotsize(v-if="isZipLoaded && isDataMissing") Results not found
                leisure-outdoor-fraction.plotsize(v-else
                  :data="leisurOutdoorFractionData"
                  :logScale="false"
                  :endDate="endDate"
                  )

            //- ---------- WEEKLY TESTS ------
          .linear-plot(v-if="weeklyTestsData.length  && allPlots[22].active")
            h5 {{ cityCap }} {{allPlots[22].name}}
              button.button.is-small.hider(@click="toggleShowPlot(22)") ..

            .hideIt(v-show="allPlots[22].showPlot")
              .plotarea(style="grid-template-rows: 18rem")
                p.plotsize(v-if="!isZipLoaded") Loading data...
                p.plotsize(v-if="isZipLoaded && isDataMissing") Results not found
                weekly-tests.plotsize(v-else
                  :data="weeklyTestsData"
                  :endDate="endDate"
                  )

          //- ---------- VEGA PLOTS ------
          .vega-plots(v-for="chartKey in Object.keys(vegaChartData)" :key="chartKey")
            .linear-plot(v-if="vegaChartData[chartKey].yaml.showAbove != true")
              vega-lite-chart.plotsize(
                :baseUrl="BATTERY_URL"
                :runId="runId"
                :configFile="chartKey"
                :logScale="logScale"
                :yamlDef="vegaChartData[chartKey].yaml"
                :data="vegaChartData[chartKey].data"
              )

          i Run ID: {{ currentRun.RunId }}
    .page-section.content(v-if="bottomNotes")
      .bottom
        h3 Further Notes
        .readme(v-html="bottomNotes")

    .page-section.footer(v-if="!state.isFullScreen")
        //- a(href="https://vsp.tu-berlin.de")
        //-   img(alt="TU-Berlin logo" src="@/assets/images/vsp-logo.png" width=225)
        a(href="https://matsim.org")
          img(alt="MATSim logo" src="@/assets/images/matsim-logo-white.png" width=250)

        p COVID-19 Scenario Viewer <br/>&copy; 2020 VSP TU-Berlin
        p GDPR: This site does not collect, store, or analyze any personal information.
        p For more info about VSP at TU Berlin, see
          a(href="https://www.vsp.tu-berlin.de") &nbsp;https://vsp.tu-berlin.de
        p: router-link(to="/imprint") Imprint

</template>

<script lang="ts">
// ###########################################################################
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import MarkdownIt from 'markdown-it'
import Papa from 'papaparse'
import VuePlotly from '@statnett/vue-plotly'
import ZipLoader from 'zip-loader'
import yaml from 'yaml'
import moment from 'moment'
import store from '@/store'
import { debounce } from 'vega'

import ActivityLevelsPlot from '@/components/ActivityLevelsPlot.vue'
import ButtonGroup from './ButtonGroup.vue'
import HeatMap from '@/components/HeatMap.vue'
import HospitalizationPlot from '@/components/HospitalizationPlot.vue'
import Hospitalization7DayNewCasesPlot from '@/components/Hospitalization7DayNewCasesPlot.vue'
import InfectionsByActivityType from '@/components/InfectionsByActivityType.vue'
import MutationsPlot from '@/components/MutationsPlot.vue'
import RValuePlot from '@/components/RValuePlot.vue'
import RValueTwo from '@/components/RValueTwo.vue'
import SVNFileSystem from '@/util/SVNFileSystem'
import VegaLiteChart from '@/components/VegaLiteChart.vue'
import WeeklyInfectionsPlot from '@/components/WeeklyInfectionsPlot.vue'
import VaccinationRates from '@/components/VaccinationRates.vue'
import VaccineEffectivenessPlot from '@/components/VaccinationEffectivenessPlot.vue'
import VaccineEffectivenessVsStrain from '@/components/VaccinationEffectivenessVsStrain.vue'
import VaccinationPerType from '@/components/VaccinationPerType.vue'
import WeeklyInfectionByVaccination from '@/components/WeeklyInfectionByVaccination.vue'
import HospitalizationVaccinationComparison from '@/components/HospitalizationVaccinationComparison.vue'
import LeisureOutdoorFraction from '@/components/LeisureOutdoorFraction.vue'
import WeeklyTests from '@/components/WeeklyTests.vue'
import PostHospital from '@/components/PostHospital.vue'
import DiseaseImport from '@/components/DiseaseImport.vue'
import AgeGroupLineChart from '@/components/AgeGroupLineChart.vue'
import Antibodies from '@/components/Antibodies.vue'
import { RunYaml, PUBLIC_SVN } from '@/Globals'

interface Measure {
  measure: string
  title: string
}

interface VegaChartDefinition {
  yaml: any
  zip?: string
  url?: string
  data?: any[]
  isVisible?: boolean
}

@Component({
  components: {
    ActivityLevelsPlot,
    ButtonGroup,
    HeatMap,
    HospitalizationPlot,
    Hospitalization7DayNewCasesPlot,
    InfectionsByActivityType,
    MutationsPlot,
    PostHospital,
    DiseaseImport,
    RValuePlot,
    RValueTwo,
    VegaLiteChart,
    VuePlotly,
    WeeklyInfectionsPlot,
    WeeklyInfectionByVaccination,
    HospitalizationVaccinationComparison,
    LeisureOutdoorFraction,
    WeeklyTests,
    AgeGroupLineChart,
    VaccinationRates,
    VaccineEffectivenessPlot,
    VaccineEffectivenessVsStrain,
    VaccinationPerType,
    Antibodies,
  },
})
export default class VueComponent extends Vue {
  @Prop({ required: true }) private runYaml!: RunYaml
  @Prop({ required: true }) private runId!: string
  @Prop({ required: true }) private chartYamlFiles!: string[]

  // var for side-menu
  private state = store.state

  private sideMenuCategories = ['Select Scenario', 'Plots']
  private activeSideMenu = 0
  private allPlots = [
    {
      index: 0,
      name: 'Activity Levels by Type',
      active: true,
      usedInThisRun: true,
      showPlot: true,
    },
    {
      index: 1,
      name: 'Disease Import', // NEW
      active: true,
      usedInThisRun: true,
      showPlot: true,
    },
    {
      index: 2,
      name: 'Hospitalization New Cases (post-process)', // NEW
      active: true,
      usedInThisRun: true,
      showPlot: true,
    },
    {
      index: 3,
      name: 'Hospitalization Rate (post-process)', // NEW
      active: true,
      usedInThisRun: true,
      showPlot: true,
    },
    {
      index: 4,
      name: 'Cases Comparison',
      active: true,
      usedInThisRun: true,
      showPlot: true,
    },
    {
      index: 5,
      name: 'Virus Strains',
      active: true,
      usedInThisRun: true,
      showPlot: true,
    },
    {
      index: 6,
      name: 'Simulated R-Values',
      active: true,
      usedInThisRun: true,
      showPlot: true,
    },
    {
      index: 7,
      name: 'Simulated R-Values by Purpose',
      active: true,
      usedInThisRun: true,
      showPlot: true,
    },
    {
      index: 8,
      name: 'Infections by Activity Type',
      active: true,
      usedInThisRun: true,
      showPlot: true,
    },
    {
      index: 9,
      name: 'Vaccine Effectiveness (against infection)',
      active: true,
      usedInThisRun: true,
      showPlot: true,
    },
    {
      index: 10,
      name: 'Vaccine Effectiveness Vs. Strain',
      active: true,
      usedInThisRun: true,
      showPlot: true,
    },
    {
      index: 11,
      name: 'Incidence comparison between vaccinated and unvaccinated persons',
      active: true,
      usedInThisRun: true,
      showPlot: true,
    },
    {
      index: 12,
      name: 'Vaccination Rates and Booster Rates',
      active: true,
      usedInThisRun: true,
      showPlot: true,
    },
    {
      index: 13,
      name: 'Vaccination per Type',
      active: true,
      usedInThisRun: true,
      showPlot: true,
    },
    {
      index: 14,
      name: 'Antibodies',
      active: true,
      usedInThisRun: true,
      showPlot: true,
    },
    {
      index: 15,
      name: 'Hospitalization New Cases',
      active: true,
      usedInThisRun: true,
      showPlot: true,
    },
    {
      index: 16,
      name: 'Hospitalization Rate Comparison',
      active: true,
      usedInThisRun: true,
      showPlot: true,
    },
    {
      index: 17,
      name: 'Hospitalization Rate Comparison for vaccinated and unvaccinated persons',
      active: true,
      usedInThisRun: true,
      showPlot: true,
    },

    {
      index: 18,
      name: 'Simulated Health Outcomes Over Time',
      active: true,
      usedInThisRun: true,
      showPlot: true,
    },
    {
      index: 19,
      name: '7-Day Incidence by Age Group Over Time (Heatmap)',
      active: true,
      usedInThisRun: true,
      showPlot: true,
    },
    {
      index: 20,
      name: '7-Day Incidence by Age Group Over Time (Linechart)',
      active: true,
      usedInThisRun: true,
      showPlot: true,
    },
    {
      index: 21,
      name: 'Leisure Outdoor Fraction',
      active: true,
      usedInThisRun: true,
      showPlot: true,
    },
    {
      index: 22,
      name: 'Weekly Tests',
      active: true,
      usedInThisRun: true,
      showPlot: true,
    },
  ]

  private berlin_population = 3574568

  // this is a fudge factor to get the ALM e.V. numbers on approx
  // the same scale as the other WeeklyInfectionPlot values.
  // It has no other meaning.
  private scaleRKISurveillanceAnteil = 40.0

  // convenience from yaml
  private startDate: string = ''
  private city: string = ''
  private offset: number[] = []

  private DEFAULT_R_VALUE_DATE = '2020-10-15'
  private summaryRValueDate = ''
  private summaryRValue = ''

  private MAX_DAYS = 1500
  private cumulativeInfected = 0

  private isZipLoaded = false
  private isDataMissing = false
  private plusminus = 0

  private logScale = true
  private cityMarkdownNotes: string = ''
  private plotTag = '{{PLOTS}}'

  private rValueMethodDescription = 'Based on four-day new infections'
  private showActivityLevels = false
  private zipActivityLevelFileName = 'XX.zip'

  private publicPath = '/'

  private BATTERY_URL = PUBLIC_SVN + 'battery/'
  private RKI_URL = PUBLIC_SVN + 'original-data/Fallzahlen/RKI/'
  private DIVI_URL = PUBLIC_SVN + 'original-data/Fallzahlen/DIVI/'
  private JAKARTA_URL = PUBLIC_SVN + 'original-data/Fallzahlen/Other/'

  private isUsingRealDates = false
  private endDate = '2020-08-31'

  private cityCSV: any = {
    berlin: this.RKI_URL + 'berlin-cases.csv',
    munich: this.RKI_URL + 'munich-cases.csv',
    heinsberg: this.RKI_URL + 'heinsberg-cases.csv',
    jakarta: this.JAKARTA_URL + 'jakarta-cases.CSV',
    cologne: this.RKI_URL + 'cologne-cases.csv',
  }

  private cityCSVMeldedatum: any = {
    berlin: this.RKI_URL + 'berlin-cases-meldedatum.csv',
  }

  private cityRKISurveillance: any = {
    berlin: this.RKI_URL + 'SARS-CoV2_surveillance.csv',
  }

  private cityCSVTests: any = {
    berlin: this.RKI_URL + 'berlin-cases-tests.csv',
  }

  private cityDIVI: any = {
    berlin: this.DIVI_URL + 'berlin-divi-processed.csv',
    munich: this.DIVI_URL + 'munich-divi-processed.csv',
    cologne: this.DIVI_URL + 'cologne-divi-processed.csv',
  }

  private get showVirusStrainsPlot() {
    return this.city !== 'jakarta'
  }

  private get showByAgePlot() {
    return this.city !== 'jakarta'
  }

  private getGroupTitle(group: any) {
    return this.calendarForSimDay(group.day) || group.heading || 'General Options'
  }

  private cachedOptionKeys = ''

  private hasMultipleOptions(group: any) {
    let hasMultiple = false
    // see if any measures have multiple values
    for (const m of group.measures) {
      if (!this.measureOptions[m.measure]) continue

      const numOptions = this.measureOptions[m.measure].length
      if (numOptions > 1) {
        hasMultiple = true
      } else {
        this.setValueForSingleOptionMeasure(m.measure)
      }
    }

    // update the single-value parameters, after everything else has settled down
    const keys = Object.keys(this.singleValueOptions)
    const keysStringify = JSON.stringify(keys)
    if (this.cachedOptionKeys !== keysStringify) {
      this.singleValueOptionKeys = keys
      this.cachedOptionKeys = keysStringify
    }

    return hasMultiple
  }

  private singleValueOptions: any = {}
  private singleValueOptionKeys: any[] = []

  // some measures only have one option! Set its value.
  private setValueForSingleOptionMeasure(measure: string) {
    let onlyValue = this.measureOptions[measure][0]
    if (onlyValue.endsWith('%') && !onlyValue.startsWith('+')) {
      const answer = onlyValue.substring(0, onlyValue.length - 1)
      onlyValue = '' + parseFloat(answer) / 100.0
      if (onlyValue === '0') onlyValue = '0.0'
      if (onlyValue === '1') onlyValue = '1.0'
    }
    const wait = true

    this.singleValueOptions[measure] = onlyValue
    this.sliderChanged(measure, onlyValue, wait)
  }

  private vegaChartData: { [chart: string]: VegaChartDefinition } = {}

  // read the yaml files for each vega chart
  // if a zip file is specified, note that so we can fetch its content later
  private async loadVegaYamlFiles() {
    for (const yamlFile of this.chartYamlFiles) {
      try {
        const url = `${this.BATTERY_URL}/${this.runId}/${yamlFile}`
        const response = await fetch(url).then()
        const text = await response.text()
        const definition = yaml.parse(text)
        const isVisible = true

        const chart: VegaChartDefinition = { yaml: definition, data: [], isVisible: isVisible }

        // is there a zip file?
        if (definition.data && definition.data.zip) {
          chart.zip = definition.data.zip
          chart.url = definition.data.url
        }

        this.vegaChartData[yamlFile] = chart
      } catch (e) {
        console.error({ e })
      }
    }
  }

  @Watch('chartYamlFiles') private async handleChartListChanged() {
    this.vegaChartData = {}
    this.loadVegaYamlFiles()
  }

  private clearZipLoaderLookups() {
    for (const zipfile of Object.values(this.zipLoaderLookup)) {
      zipfile.clear()
    }
    this.zipLoaderLookup = {}
    // this.csvCache = {}
    // this.promisedZipFile = null
    this.cachedOptionKeys = ''
  }

  private async setWideMode(mode: boolean) {
    this.$store.commit('setWideMode', mode)
    await this.$nextTick()
    this.$forceUpdate()
  }

  @Watch('runYaml') private async switchYaml() {
    if (!this.runYaml.city) return

    this.summaryRValueDate = this.runYaml.rValueDate || this.DEFAULT_R_VALUE_DATE

    this.clearZipLoaderLookups()
    this.isUsingRealDates = false

    this.$nextTick()

    this.city = this.runYaml.city
    this.offset = []
    this.vegaChartData = {}

    await this.loadVegaYamlFiles()

    // set start date
    if (this.runYaml.startDate) this.startDate = this.runYaml.startDate
    else if (this.runYaml.defaultStartDate) this.startDate = this.runYaml.defaultStartDate
    else {
      alert('Uh-oh, YAML file has no startDate AND no defaultStartDate!')
      return
    }

    // set start date for Graphs -- not the same as start date of simulation
    this.$store.commit('setGraphStartDate', this.runYaml.graphStartDate || '2020-02-09') // this.startDate)

    // set end date
    this.endDate = this.runYaml.endDate ? this.runYaml.endDate : '2020-08-31'
    // console.log({ endDate: this.endDate })
    this.layout.xaxis.range = [this.$store.state.graphStartDate, this.endDate]

    // build offsets
    if (!this.runYaml.offset && !this.runYaml.startDates) {
      alert('Uh-oh, YAML file has no offsets AND no startDates!')
      return
    }

    if (!this.runYaml.offset) {
      if (!this.runYaml.startDates) {
        alert("Need startDates in YAML if we don't have offsets")
        return
      }
      this.isUsingRealDates = true
      const defaultDate = moment(this.runYaml.defaultStartDate)
      for (const d of this.runYaml.startDates) {
        const date = moment(d)
        const diff = date.diff(defaultDate, 'days')
        this.offset.push(diff)
        if (date.isSame(d)) this.plusminus = diff
      }
    } else {
      this.offset = this.runYaml.offset
      this.plusminus = this.runYaml.offset[0]
    }

    this.updateNotes()

    // berlin has some observed data, other cities don't
    if (this.cityCSV[this.city]) {
      this.observedCases = await this.prepareObservedData(this.city)
      this.diviData = await this.prepareDiviData(this.city)
    }

    await this.loadInfoTxt()
    this.runChanged()
    this.showActivityLevelPlot()

    this.hasBaseRun = this.isThereABaseRun()

    //chang disabled plots
    for (let i = 0; i < this.allPlots.length; i++) {
      this.allPlots[i].active = true
    }
    if (Object.keys(this.runYaml).includes('ignoredPlots')) {
      if (this.runYaml.ignoredPlots?.includes('hospNewCases')) {
        this.allPlots[15].active = false
      }
      if (this.runYaml.ignoredPlots?.includes('hospRateComp')) {
        this.allPlots[16].active = false
      }
      if (this.runYaml.ignoredPlots?.includes('vacEffInf')) {
        this.allPlots[9].active = false
      }
      if (this.runYaml.ignoredPlots?.includes('vacEffStrain')) {
        this.allPlots[10].active = false
      }
      if (this.runYaml.ignoredPlots?.includes('incVacUnvac')) {
        this.allPlots[11].active = false
      }
      if (this.runYaml.ignoredPlots?.includes('vacBoostRate')) {
        this.allPlots[12].active = false
      }
      if (this.runYaml.ignoredPlots?.includes('vacType')) {
        this.allPlots[13].active = false
      }
      if (this.runYaml.ignoredPlots?.includes('hospVacUnvac')) {
        this.allPlots[17].active = false
      }
      if (this.runYaml.ignoredPlots?.includes('healthOutcome')) {
        this.allPlots[18].active = false
      }
    }

    this.showPlotForCurrentSituation()
  }

  @Watch('plusminus') private switchPlusMinus() {
    this.showPlotForCurrentSituation()
  }

  @Watch('logScale') updateScale() {
    this.layout.yaxis.type = this.logScale ? 'log' : 'linear'
  }

  private switchRMethod(method: string) {
    this.rValueMethodDescription = method
  }

  private isBase = false
  private currentRun: any = {}

  private data: any[] = []
  private dataHealth: any[] = []

  private measureOptions: any = {}
  private runLookup: any = {}

  private observedCases: any[] = []
  private diviData: any[] = []

  private showIncidenceComp = false

  private toggleShowPlot(which: number) {
    this.allPlots[which].showPlot = !this.allPlots[which].showPlot
  }

  private layout = {
    autosize: true,
    showlegend: true,
    legend: {
      orientation: 'h',
      y: '-0.15',
    },
    font: {
      family: 'Roboto,Arial,Helvetica,sans-serif',
      size: 12,
      color: '#000',
    },
    margin: { t: 5, r: 10, b: 0, l: 60 },
    xaxis: {
      range: ['2020-02-09', '2020-12-31'],
      fixedrange: true,
      type: 'date',
    },
    yaxis: {
      type: this.logScale ? 'log' : 'linear',
      fixedrange: true,
      autorange: true,
      title: 'Population',
    },
    plot_bgcolor: '#f8f8f8',
    paper_bgcolor: '#f8f8f8',
  }

  private strOffset(offset: number) {
    return (offset > 0 ? '+' : '') + offset
  }

  private options = {
    // displayModeBar: true,
    displaylogo: false,
    responsive: true,
    modeBarButtonsToRemove: [
      'pan2d',
      'zoom2d',
      'select2d',
      'lasso2d',
      'zoomIn2d',
      'zoomOut2d',
      'autoScale2d',
      'hoverClosestCartesian',
      'hoverCompareCartesian',
      'resetScale2d',
      'toggleSpikelines',
      'resetViewMapbox',
    ],
    toImageButtonOptions: {
      format: 'svg', // one of png, svg, jpeg, webp
      filename: 'covid-plot',
      width: 1200,
      height: 600,
      scale: 1.0, // Multiply title/legend/axis/canvas sizes by this factor
    },
  }

  private setBase(value: boolean) {
    this.isBase = value
    this.showPlotForCurrentSituation()
  }

  private setPlusMinus(value: string) {
    const shift = parseInt(value)
    // console.log('SET PLUS MINUS:', shift)
    this.plusminus = shift
  }

  private get cityCap() {
    return this.city.slice(0, 1).toUpperCase() + this.city.slice(1)
  }

  private isThereABaseRun() {
    const files = this.zipLoader.files
    if (!files) return

    console.log({ ZIPLODER: this.zipLoader })
    const baseFilename = 'sz0' + '.infections.txt.csv'

    console.log('DOES SZ0 EXIST: ', files.hasOwnProperty(baseFilename))

    return files.hasOwnProperty(baseFilename)
  }

  private currentSituation: any = {}
  private loadedSeriesData: any = {}
  private zipLoader: any = {}

  private labels: any = {
    nSusceptible: 'Susceptible',
    nSusceptibleVaccinated: 'SusceptibleVaccinated',
    nInfectedButNotContagious: 'Infected, not contagious',
    nContagious: 'Contagious',
    nContagiousVaccinated: 'ContagiousVaccinated',
    nShowingSymptoms: 'Showing Symptoms',
    nShowingSymptomsVaccinated: 'ShowingSymptomsVaccinated',
    nSeriouslySick: 'Seriously Sick',
    nSeriouslySickCumulative: 'Seriously Sick Cumulative',
    nSeriouslySickVaccinated: 'SeriouslySickVaccinated',
    nCritical: 'Critical',
    nCriticalVaccinated: 'CriticalVaccinated',
    nTotalInfected: 'Total Infected',
    nTotalInfectedVaccinated: 'TotalInfectedVaccinated',
    nInfectedCumulative: 'Infected Cumulative',
    nInfectedCumulativeVaccinated: 'InfectedCumulativeVaccinated',
    nRecovered: 'Recovered',
    nInQuarantine: 'In Quarantine',
    nHospitalCumulative: 'Cumulative Hospitalized',
    nShowingSymptomsCumulative: 'Showing Symptoms Cum.',
    nShowingSymptomsCumulativeVaccinated: 'ShowingSymptomsCumulativeVaccinated',
    nVaccinated: 'Vaccinated',
    nContagiousCumulativeVaccinated: 'ContagiousCumulativeVaccinated',
    nSeriouslySickCumulativeVaccinated: 'SeriouslySickCumulativeVaccinated',
    nCriticalCumulativeVaccinated: 'CriticalCumulativeVaccinated',
    nRecoveredVaccinated: 'RecoveredVaccinated',
    nReVaccinated: 'Boosted',
  }

  private async mounted() {
    this.loadCoronaDetectionRateData()
    this.switchYaml()
  }

  private isResizing = false
  @Watch('$store.state.isWideMode') async handleWideModeChanged() {
    this.isResizing = true
    await this.$nextTick()
    this.layout = Object.assign({}, this.layout)
    this.isResizing = false
  }

  private unreportedIncidence: any = {}

  @Watch('cityCap') async loadUnreportedIncidence() {
    if (this.cityCap == 'Cologne') {
      const url =
        'https://svn.vsp.tu-berlin.de/repos/public-svn/matsim/scenarios/countries/de/episim/underreporting/InzidenzDunkelzifferCologne.csv'

      try {
        const response = await fetch(url)
        const csvContents = await response.text()
        this.unreportedIncidence = Papa.parse(csvContents, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
        }).data
      } catch (e) {
        console.warn(e)
      }
    }
  }

  private unreportedIncidenceNRW: any = {}

  @Watch('cityCap') async loadUnreportedIncidenceNRW() {
    if (this.cityCap == 'Cologne') {
      const url =
        'https://svn.vsp.tu-berlin.de/repos/public-svn/matsim/scenarios/countries/de/episim/underreporting/InzidenzDunkelzifferNRW.csv'

      try {
        const response = await fetch(url)
        const csvContents = await response.text()
        this.unreportedIncidenceNRW = Papa.parse(csvContents, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
        }).data
      } catch (e) {
        console.warn(e)
      }
    }
  }

  private rkiDetectionRateData: { x?: any[]; y?: any[]; line?: any; name?: string } = {}

  private async loadCoronaDetectionRateData() {
    // Load CSV data of Corona-Datenspende from RKI -- Berlin+Brandenburg only

    const url =
      'https://raw.githubusercontent.com/corona-datenspende/data-updates/master/detections/detection.csv'

    try {
      const response = await fetch(url)
      const csvContents = await response.text()
      const rawdata = Papa.parse(csvContents, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      }).data

      const region = rawdata.filter((a: any) => a.state_de === 'Berlin')

      const trimmedData = region
        .map(a => {
          return { date: a.date, rkiDetected: this.berlin_population * a.detection_rate_trend }
        })
        .sort((a, b) => (a.date < b.date ? -1 : 1))

      const x = trimmedData.map(a => a.date)
      const y = trimmedData.map(a => a.rkiDetected)

      const plotData = {
        name: 'NEW RKI Detection Rate Trend',
        visible: 'legendonly',
        x,
        y,
        line: {
          dash: 'dot',
          width: 2,
          color: 'rgb(200,0,0)',
        },
      }
      this.rkiDetectionRateData = plotData
    } catch (e) {
      console.warn(e)
    }
  }

  private get prettyInfected() {
    if (!this.cumulativeInfected) return ''

    const rounded = 100 * Math.round(this.cumulativeInfected * 0.01)
    return Number(rounded).toLocaleString()
  }

  private hasBaseRun = false

  private promisedZipFile: any = null

  private async loadZipFile(whichZip: string) {
    if (this.promisedZipFile) return await this.promisedZipFile

    this.promisedZipFile = new Promise(async (resolve, reject) => {
      const filepath = `${this.BATTERY_URL}${this.runId}/${this.runYaml.zipFolder}/${whichZip}.zip`
      const zloader = new ZipLoader(filepath)
      await zloader.load()

      this.isZipLoaded = true
      resolve(zloader)
    })

    return await this.promisedZipFile
  }

  private async showActivityLevelPlot() {
    this.showActivityLevels = true
  }

  private hospitalData: any[] = []
  private rValues: any[] = []
  private incidenceHeatMapData: string = ''
  private leisurOutdoorFractionData: any[] = []
  private weeklyTestsData: any[] = [] // includes nReVaccinated values
  private diseaseData: any[] = []
  private postHospital: any[] = []

  private async runChanged() {
    const ignoreRow = 'Cumulative Hospitalized'
    const ignoreRowHealth = [
      'SusceptibleVaccinated',
      'ContagiousVaccinated',
      'ShowingSymptomsVaccinated',
      'SeriouslySickVaccinated',
      'CriticalVaccinated',
      'TotalInfectedVaccinated',
      'InfectedCumulativeVaccinated',
      'ShowingSymptomsCumulativeVaccinated',
      'ContagiousCumulativeVaccinated',
      'SeriouslySickCumulativeVaccinated',
      'CriticalCumulativeVaccinated',
      'RecoveredVaccinated',
      'Cumulative Hospitalized',
    ]

    // load run dataset
    const csv: any[] = await this.loadCSVs(this.currentRun)
    // zip might not yet be loaded
    if (csv.length === 0) return

    this.loadVaccineEffectivenessData(this.currentRun)

    this.loadVaccineEffectivenessVsStrainData(this.currentRun)

    this.loadIncidenceHeatMapData(this.currentRun)

    this.loadMutationValues(this.currentRun)

    this.loadVaccinationPerType(this.currentRun)

    this.loadAntibodies(this.currentRun)

    this.loadRValues(this.currentRun)

    this.loadInfectionsByActivityType(this.currentRun)

    this.loadWeeklyTests(this.currentRun)

    this.loaddiseaseImport(this.currentRun)

    this.loadPostHospital(this.currentRun)

    this.loadLeisurOutdoorFraction(this.currentRun)

    const timeSerieses = this.generateSeriesFromCSVData(csv)

    // cache the result
    this.loadedSeriesData[this.currentRun.RunId] = timeSerieses

    // populate the data where we need it
    this.hospitalData = timeSerieses
    this.data = timeSerieses.filter(row => row.name !== ignoreRow)

    this.addDataFromInfectionsCSVToData('nReVaccinated')

    this.updateTotalInfected()
    this.updateVegaCharts()
    this.dataHealth = this.data.filter(row => !ignoreRowHealth.includes(row.name))

    this.updatePlotMenu()
  }

  private updatePlotMenu() {
    if (!this.showActivityLevels) {
      this.allPlots[0].usedInThisRun = false
    }

    if (this.diseaseData.length == 0) {
      this.allPlots[1].usedInThisRun = false
    }

    if (this.postHospital.length == 0) {
      this.allPlots[2].usedInThisRun = false
      this.allPlots[3].usedInThisRun = false
    }

    if (!this.showVirusStrainsPlot || !(this.mutationValues.length > 0)) {
      this.allPlots[5].usedInThisRun = false
    }

    if (!this.hasRValuePurposes) {
      this.allPlots[7].usedInThisRun = false
    }

    if (!(this.infectionsByActivityType.length > 0)) {
      this.allPlots[8].usedInThisRun = false
    }

    if (!this.showVaccineEffectivenessFields.length) {
      this.allPlots[9].usedInThisRun = false
    }

    if (!this.showVaccineEffectivenessVsStrainFields.length) {
      this.allPlots[10].usedInThisRun = false
    }

    if (!this.showIncidenceComp) {
      this.allPlots[11].usedInThisRun = false
      this.allPlots[12].usedInThisRun = false
      this.allPlots[17].usedInThisRun = false
    }

    if (!this.showIncidenceComp || !(this.vaccinationPerType.length > 0)) {
      this.allPlots[13].usedInThisRun = false
    }

    if (!this.showIncidenceComp || !(this.antibodies.length > 0)) {
      this.allPlots[14].usedInThisRun = false
    }

    if (this.city == 'heinsberg') {
      this.allPlots[16].usedInThisRun = false
    }

    if (!this.showByAgePlot || !this.incidenceHeatMapData) {
      this.allPlots[19].usedInThisRun = false
      this.allPlots[20].usedInThisRun = false
    }

    if (!this.leisurOutdoorFractionData.length) {
      this.allPlots[21].usedInThisRun = false
    }

    if (!this.weeklyTestsData.length) {
      this.allPlots[22].usedInThisRun = false
    }
  }

  private addDataFromInfectionsCSVToData(valueName: string) {
    if (this.weeklyTestsData.length) {
      var dates = []
      var values = []
      for (var i = 0; i < this.weeklyTestsData.length; i++) {
        dates[i] = this.weeklyTestsData[i].date
        values[i] = this.weeklyTestsData[i].nReVaccinated
      }
      var nReVaccinated = {
        name: valueName,
        x: dates,
        y: values,
      }
      this.data.push(nReVaccinated)
    }
  }

  private updateVegaCharts() {
    for (const key of Object.keys(this.vegaChartData)) {
      const chart = this.vegaChartData[key]
      // nothing to do if no zip file was specified
      if (!chart.zip || !chart.url) continue

      try {
        const filename = chart.url.replace('$RUN$', this.currentRun.RunId)
        let text = this.zipLoader.extractAsText(filename)
        const z = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true })

        const dateBracket = z.data.filter(point => point.date <= this.endDate)

        // if data doesn't go out to end-date, straightline it
        const lastEntry = dateBracket[dateBracket.length - 1]
        if (lastEntry.date < this.endDate) {
          dateBracket.push(lastEntry)
          dateBracket[dateBracket.length - 1].date = this.endDate
        }

        chart.data = dateBracket
      } catch (e) {
        console.log('YEEEARGH')
        console.log(e)
      }
    }
  }

  private updateTotalInfected() {
    const infectedCumulative = this.data.filter(a => a.name === 'Infected Cumulative')[0]

    for (let i = 0; i < infectedCumulative.x.length; i++) {
      if (infectedCumulative.x[i] === this.endDate) {
        // console.log('got it:', infectedCumulative.x[i], infectedCumulative.y[i])
        this.cumulativeInfected = infectedCumulative.y[i]
        return
      }
    }

    // if we got here, date never matched. Just show max.
    this.cumulativeInfected = Math.max(...infectedCumulative.y)
  }

  private gotNewSummaryRValue(v: string) {
    this.summaryRValue = v
  }

  private sliderChanged(measure: any, value: any, wait?: boolean) {
    // console.log(measure, value)
    this.currentSituation[measure] = value
    if (!wait) this.showPlotForCurrentSituation()
  }

  private showPlotForCurrentSituation() {
    if (this.isBase) {
      this.currentRun = { RunId: 'sz0' }
      this.runChanged()
      return
    }

    let lookupKey = ''
    for (const measure of Object.keys(this.measureOptions))
      lookupKey += this.currentSituation[measure] + '-'

    // determine: use offset numeral, or offset date?
    if (this.isUsingRealDates) {
      const defaultDate = moment(this.runYaml.defaultStartDate)
      const diff = defaultDate.add(this.plusminus, 'days')
      // console.log(diff)
      lookupKey = lookupKey.replace('undefined', diff.format('YYYY-MM-DD'))
    } else {
      const offsetPrefix = '' + this.plusminus
      lookupKey = lookupKey.replace('undefined', offsetPrefix)
    }

    // console.log(lookupKey)

    this.currentRun = this.runLookup[lookupKey]

    if (!this.currentRun) {
      this.isDataMissing = true
      console.log('Could not find this run in the zip:' + lookupKey)
      return
    }

    this.isDataMissing = false
    this.runChanged()
  }

  private unpack(rows: any[], key: any) {
    let v = rows.map(row => {
      if (key === 'day') return row[key]
      return row[key]
    })

    v = v.slice(0, this.MAX_DAYS)

    // maybe the sim ended early - go out to 150 anyway
    if (v.length < this.MAX_DAYS) {
      v.push(key === 'day' ? this.MAX_DAYS : v[v.length - 1])
    }
    return v
  }

  private async loadIncidenceHeatMapData(currentRun: any) {
    this.incidenceHeatMapData = ''

    if (!currentRun.RunId) return
    if (this.zipLoader === {}) return

    const filename = currentRun.RunId + '.post.incidenceByAge.tsv'

    try {
      let text = this.zipLoader.extractAsText(filename)
      this.incidenceHeatMapData = text
    } catch (e) {
      // console.log('INCIDENCE HEAT MAP DATA: fail', filename)
    }
  }

  private infectionsByActivityType: any[] = []
  private async loadInfectionsByActivityType(currentRun: any) {
    this.infectionsByActivityType = []

    if (!currentRun.RunId) return
    if (this.zipLoader === {}) return

    const filename = currentRun.RunId + '.infectionsPerActivity.txt.tsv'

    try {
      let text = this.zipLoader.extractAsText(filename)
      const z = Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        delimiter: '\t',
      })

      this.infectionsByActivityType = z.data
    } catch (e) {
      console.log('INFECTIONSPERACTIVITY: no', filename)
    }
  }

  private hasRValuePurposes = false

  private async loadRValues(currentRun: any) {
    this.rValues = []
    this.hasRValuePurposes = false

    if (!currentRun.RunId) return
    if (this.zipLoader === {}) return

    const filename = currentRun.RunId + '.rValues.txt.csv'

    try {
      let text = this.zipLoader.extractAsText(filename)
      const z = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true })

      this.rValues = z.data
      if (z.meta.fields.indexOf('home') > -1) this.hasRValuePurposes = true
    } catch (e) {
      console.log('RVALUES: no', filename)
    }
  }

  private async loaddiseaseImport(currentRun: any) {
    this.diseaseData = []
    if (!currentRun.RunId) return
    if (this.zipLoader === {}) return
    const filename = currentRun.RunId + '.diseaseImport.tsv'
    try {
      let text = this.zipLoader.extractAsText(filename)
      const z = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true })
      this.diseaseData = z.data
    } catch (e) {
      console.log('DiseaseData: no', filename)
    }
  }
  private async loadPostHospital(currentRun: any) {
    this.postHospital = []
    if (!currentRun.RunId) return
    if (this.zipLoader === {}) return
    const filename = currentRun.RunId + '.post.hospital.tsv'
    try {
      let text = this.zipLoader.extractAsText(filename)
      const z = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true })
      this.postHospital = z.data
    } catch (e) {
      console.log('postHospital: no', filename)
    }
  }

  private hasLeisurOutdoorFraction = false

  private async loadLeisurOutdoorFraction(currentRun: any) {
    this.leisurOutdoorFractionData = []
    this.hasLeisurOutdoorFraction = false

    if (!currentRun.RunId) return
    if (this.zipLoader === {}) return

    const filename = currentRun.RunId + '.outdoorFraction.tsv'

    try {
      let text = this.zipLoader.extractAsText(filename)
      const z = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true })

      this.leisurOutdoorFractionData = z.data
      if (z.meta.fields.indexOf('home') > -1) this.hasLeisurOutdoorFraction = true
    } catch (e) {
      console.log('LeisurOutdoorFraction: no', filename)
    }
  }

  private vaccineEffectivenessData: any[] = []
  private showVaccineEffectivenessFields: string[] = []

  private async loadVaccineEffectivenessData(currentRun: any) {
    this.vaccineEffectivenessData = []
    this.showVaccineEffectivenessFields = []

    if (!currentRun.RunId) return
    if (this.zipLoader === {}) return

    const filename = currentRun.RunId + '.post.vaccineEff.tsv'

    try {
      let text = this.zipLoader.extractAsText(filename)
      const z = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true })

      if (z.meta.fields.indexOf('day') > -1) {
        this.vaccineEffectivenessData = z.data
        this.showVaccineEffectivenessFields = z.meta.fields
      }
    } catch (e) {
      console.log('NO VaccineEffectiveness:', filename)
    }
  }

  private vaccineEffectivenessVsStrainData: any[] = []
  private showVaccineEffectivenessVsStrainFields: string[] = []

  private async loadVaccineEffectivenessVsStrainData(currentRun: any) {
    this.vaccineEffectivenessVsStrainData = []
    this.showVaccineEffectivenessVsStrainFields = []

    if (!currentRun.RunId) return
    if (this.zipLoader === {}) return

    const filename = currentRun.RunId + '.post.ve.tsv'

    try {
      let text = this.zipLoader.extractAsText(filename)
      const z = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true })

      if (z.meta.fields.indexOf('day') > -1) {
        this.vaccineEffectivenessVsStrainData = z.data
        this.showVaccineEffectivenessVsStrainFields = z.meta.fields
      }
    } catch (e) {
      console.log('NO VaccineEffectivenessVsStrain:', filename)
    }
  }

  private hasWeeklyTests = false

  private async loadWeeklyTests(currentRun: any) {
    this.weeklyTestsData = []
    this.hasWeeklyTests = false

    if (!currentRun.RunId) return
    if (this.zipLoader === {}) return

    const filename = currentRun.RunId + '.infections.txt.csv'

    try {
      let text = this.zipLoader.extractAsText(filename)
      const z = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true })

      this.weeklyTestsData = z.data
      if (z.meta.fields.indexOf('home') > -1) this.hasWeeklyTests = true
    } catch (e) {
      console.log('WeeklyTests: no', filename)
    }
  }

  private vaccinationPerType: any[] = []

  private async loadVaccinationPerType(currentRun: any) {
    this.vaccinationPerType = []

    if (!currentRun.RunId) return
    if (this.zipLoader === {}) return

    const filename = currentRun.RunId + '.vaccinations.tsv'

    try {
      let text = this.zipLoader.extractAsText(filename)
      const z = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true })

      this.vaccinationPerType = z.data
    } catch (e) {
      console.log('Vaccination Per Type: no', filename)
    }
  }

  private antibodies: any[] = []

  private async loadAntibodies(currentRun: any) {
    this.antibodies = []

    if (!currentRun.RunId) return
    if (this.zipLoader === {}) return

    const filename = currentRun.RunId + '.antibodies.tsv'

    try {
      let text = this.zipLoader.extractAsText(filename)
      const z = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true })

      this.antibodies = z.data
    } catch (e) {
      console.log('Antibodies: no', filename)
    }
  }

  private mutationValues: any[] = []

  private async loadMutationValues(currentRun: any) {
    this.mutationValues = []

    if (!currentRun.RunId) return
    if (this.zipLoader === {}) return

    const filename = currentRun.RunId + '.strains.tsv'

    try {
      let text = this.zipLoader.extractAsText(filename)
      const z = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true })

      this.mutationValues = z.data
    } catch (e) {
      console.log('MUTATIONS: no', filename)
    }
  }

  private zipLoaderLookup: { [run: string]: any } = {} // holds the ZipLoaders
  private csvCache: { [filename: string]: Promise<any[]> } = {} // holds CSV tables

  private async loadCSVs(currentRun: any) {
    if (!currentRun.RunId) return []

    // get the ZipLoader for this run
    if (this.zipLoaderLookup[currentRun.RunId]) {
      // already loaded! Use cached copy
      console.log('** zip is cached')
      this.zipLoader = this.zipLoaderLookup[currentRun.RunId]
    } else {
      // need to load it from disk
      console.log('nope, loading from disk')
      this.zipLoader = await this.loadZipFile(currentRun.RunId)
      this.zipLoaderLookup[currentRun.RunId] = this.zipLoader
    }

    if (this.zipLoader === {}) return []
    if (!this.zipLoader.extractAsText) return []

    const filename = currentRun.RunId + '.infections.txt.csv'

    if (filename in this.csvCache) {
      return await this.csvCache[filename]
    }

    this.csvCache[filename] = new Promise((resolve, reject) => {
      console.log('7 Extracting', filename)
      let text = this.zipLoader.extractAsText(filename)
      const z = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true })
      resolve(z.data)
    })

    return await this.csvCache[filename]
  }

  private calendarForSimDay(day: number) {
    if (day === -1) return ''

    const date = moment(this.startDate)
      .add(day - 1, 'days') // Day ONE is first day, so add days BEYOND day one
      .format('MMM DD')

    return date
  }

  private calculateDatefromSimulationDay(day: number) {
    const date = moment(this.startDate)
      .add(this.plusminus, 'days')
      .add(day - 1, 'days') // Day ONE is first day, so add days BEYOND day one
      .format('YYYY-MM-DD')
    return date
  }

  private generateSeriesFromCSVData(data: any[]) {
    const serieses = []

    const days: number[] = this.unpack(data, 'day')
    const x = days.map(d => this.calculateDatefromSimulationDay(d))

    for (const column of Object.keys(this.labels)) {
      const name = this.labels[column]

      if (name === 'In Quarantine') continue

      const y: number[] = this.unpack(data, column)
      serieses.push({ x, y, name })
    }

    if (serieses[1].y[0] === undefined) {
      this.showIncidenceComp = false
    } else {
      this.showIncidenceComp = true
    }

    // Add Observed Data
    if (this.observedCases.length > 0) {
      // only add RKI line, because DIVI cumulative doesn't start at the beginning
      // of the epidemic.
      serieses.push(this.observedCases[0])
    }

    // // Add RKI Detection-Rate-Trend Data
    if (
      (this.city === 'berlin' && this.rkiDetectionRateData.x) ||
      (this.city === 'cologne' && this.rkiDetectionRateData.x)
    ) {
      serieses.push(this.rkiDetectionRateData)
    }

    return serieses
  }

  private async prepareDiviData(newCity: string) {
    const serieses: any[] = []

    if (!this.cityDIVI[newCity]) return serieses

    const response = await fetch(this.cityDIVI[newCity])
    const csvContents = await response.text()
    const data = Papa.parse(csvContents, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    }).data

    const dates: any = []
    const cases: any = []
    let cumulative = 0

    // pull the cases field out of the CSV
    for (const datapoint of data) {
      try {
        const day = datapoint.date
        if (datapoint.faelle_covid_aktuell) {
          dates.push(day)
          cases.push(datapoint.faelle_covid_aktuell)
        }
      } catch (e) {
        // well, some lines are badly formatted. ignore them
      }
    }

    serieses.push({
      name: 'Reported: ' + this.cityCap + ' Intensive Care (DIVI)',
      x: dates,
      y: cases,
      line: {
        dash: 'dot',
        width: 2,
        color: 'rgb(0,200,50)',
      },
    })

    return serieses
  }

  private async prepareObservedData(newCity: string) {
    const serieses = []

    // 1 - CASES DATA
    if (this.cityCSV[newCity]) {
      const response = await fetch(this.cityCSV[newCity])
      const csvContents = await response.text()
      const data = Papa.parse(csvContents, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      }).data

      const xdates: any = []
      const xcases: any = []
      let cumulative = 0

      // pull the cases field out of the CSV
      for (const datapoint of data) {
        const day = datapoint.year + '-' + datapoint.month + '-' + datapoint.day
        xdates.push(day)
        cumulative += datapoint.cases
        xcases.push(cumulative)
      }

      const name = newCity !== 'jakarta' ? `RKI ${this.cityCap} Infections` : 'Observed Infections'
      serieses.push({
        name,
        x: xdates,
        y: xcases,
        line: {
          dash: 'dot',
          width: 3,
          color: '#080',
        },
      })
    }

    //get the meldedatum
    if (this.cityCSVMeldedatum[newCity]) {
      const responseM = await fetch(this.cityCSVMeldedatum[newCity])
      const csvContentsM = await responseM.text()
      const dataM = Papa.parse(csvContentsM, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      }).data

      const mDates: any = []
      const mCases: any = []
      let mCumulative = 0
      const mOffset = -1

      // pull the cases field out of the CSV
      for (const datapoint of dataM) {
        let dayObject = moment({
          year: datapoint.year,
          month: datapoint.month - 1,
          day: datapoint.day,
        })
        dayObject.add(mOffset, 'days')

        const day = dayObject.format('YYYY-MM-DD')

        mDates.push(day)
        mCumulative += datapoint.cases
        mCases.push(mCumulative)
      }

      serieses.push({
        name: 'RKI-Meldedatum ' + this.cityCap,
        x: mDates,
        y: mCases,
        mode: 'markers',
        type: 'scatter',
        marker: { color: '#6d2', size: 3 },
      })
    }

    //get test data
    if (this.cityCSVTests[newCity]) {
      const responseT = await fetch(this.cityCSVTests[newCity])
      const csvContentsT = await responseT.text()
      const dataT = Papa.parse(csvContentsT, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      }).data

      const tDates: any = []
      const tCases: any = []
      let tCumulative = 0
      const tOffset = 0

      // pull the cases field out of the CSV
      for (const datapoint of dataT) {
        let dayObject = moment({
          year: datapoint.year,
          month: datapoint.month - 1,
          day: datapoint.day,
        })
        dayObject.add(tOffset, 'days')

        const day = dayObject.format('YYYY-MM-DD')

        tDates.push(day)
        tCumulative += datapoint.cases
        tCases.push(tCumulative)
      }
      serieses.push({
        name: 'Positive Tests ' + this.cityCap,
        x: tDates,
        y: tCases,
        mode: 'markers',
        type: 'scatter',
        marker: { color: '#f42', size: 4 },
      })
    }

    // get case surveillance data
    if (this.cityRKISurveillance[newCity]) {
      const responseSurv = await fetch(this.cityRKISurveillance[newCity])
      const csvContentsSurv = await responseSurv.text()
      const survData = Papa.parse(csvContentsSurv, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        delimiter: ';',
      }).data

      const sDates: any = []
      const sShare: any = []
      const text: any = []

      // pull the cases field out of the CSV
      for (const xdatapoint of survData) {
        const dateField = xdatapoint['Beginn Meldewoche']
        const year = parseInt(dateField.substring(6, 10))
        const month = parseInt(dateField.substring(3, 5)) - 1
        const zday = parseInt(dateField.substring(0, 2))
        let dayObject = moment({
          year,
          month,
          day: zday,
        })

        const day = dayObject.format('YYYY-MM-DD')
        const estimPositive = xdatapoint['Anteil positiver Tests Lagebericht ' + this.cityCap]

        if (day === 'Invalid date') continue

        sDates.push(day)
        sShare.push(this.scaleRKISurveillanceAnteil * estimPositive)
        text.push(estimPositive)
      }

      serieses.push({
        name: 'Reported: Share Positive Tests (ALM e.V.)',
        x: sDates,
        y: sShare,
        text: text,
        mode: 'markers',
        type: 'scatter',
        hovertemplate: '%{text}%',
        marker: { symbol: 'cross', color: '#f80', size: 5 },
      })
    }

    return serieses
  }

  private async parseInfoTxt(city: string) {
    const filepath = this.BATTERY_URL + this.runId + '/_info.txt'

    const response = await fetch(filepath)
    const text = await response.text()
    const parsed: any = Papa.parse(text, { header: true, dynamicTyping: false })

    return parsed.data
  }

  private async loadInfoTxt() {
    console.log('_info.txt: generating lookups')

    const infoTxt = await this.parseInfoTxt(this.city)

    const measures: any = {}
    const runLookup: any = {}

    // first get column names for the measures that have been tested
    const ignore = ['Config', 'Output', 'RunId', 'RunScript']

    for (const label of Object.keys(infoTxt[0])) {
      if (ignore.indexOf(label) > -1) continue
      measures[label] = new Set()
    }

    // get all possible values
    for (const row of infoTxt) {
      if (!row.RunId) continue

      // note this particular value, for every value
      for (const measure of Object.keys(measures)) {
        if (row[measure] === 0 || row[measure]) measures[measure].add('' + row[measure])
      }

      // store the run in a lookup using all values as the key
      let lookupKey = ''
      for (const measure of Object.keys(measures)) {
        lookupKey += row[measure] + '-'
      }
      runLookup[lookupKey] = row
    }

    for (const measure of Object.keys(measures)) {
      measures[measure] = Array.from(measures[measure].keys()).sort((a: any, b: any) =>
        a < b ? -1 : 1
      )
    }

    this.runLookup = runLookup
    this.measureOptions = measures

    // Runs v8 and v9 require this because they don't have an sz0 run:
    this.currentRun = infoTxt[0].RunId
  }

  private mdParser = new MarkdownIt()

  private async updateNotes() {
    const url = this.BATTERY_URL + this.runId + '/' + this.runYaml.readme

    const response = await fetch(url)

    if (response.status !== 200) return

    const text = await response.text()

    // bad url
    if (text.startsWith('<!DOCTYPE')) return

    this.cityMarkdownNotes = this.mdParser.render(text)
  }

  private get topNotes() {
    if (!this.cityMarkdownNotes) return ''

    const i = this.cityMarkdownNotes.indexOf(this.plotTag)

    if (i < 0) return this.cityMarkdownNotes
    return this.cityMarkdownNotes.substring(0, i)
  }

  private get bottomNotes() {
    if (!this.cityMarkdownNotes) return ''

    const i = this.cityMarkdownNotes.indexOf(this.plotTag)

    if (i < 0) return ''
    return this.cityMarkdownNotes.substring(i + this.plotTag.length)
  }

  private updateSideMenu(categorie: string) {
    const index = this.sideMenuCategories.indexOf(categorie)
    this.activeSideMenu = index == this.activeSideMenu ? -1 : index
  }

  private allPlotsCheckIsUsedInThisRun() {
    return this.allPlots.filter(function(u) {
      return u.usedInThisRun
    })
  }

  private showVegaPlots(id: string) {
    if (this.vegaChartData[id].isVisible) {
      this.vegaChartData[id].isVisible = false
    } else {
      this.vegaChartData[id].isVisible = true
    }
  }

  private showPlotMenu(index: any) {
    if (index === 'allActive') {
      this.allPlots.forEach(element => (element.active = true))
    } else if (index === 'allInactive') {
      this.allPlots.forEach(element => (element.active = false))
    } else {
      this.allPlots[index].active = !this.allPlots[index].active
    }
  }
}

// ###########################################################################
</script>

<style scoped lang="scss">
@import '@/styles.scss';

.width-selection {
  margin-left: auto;
  margin-right: 1rem;
  font-size: 0.9rem;
}

.width-selection a {
  margin-left: 0.5rem;
}

a.active-view-mode {
  text-decoration: underline;
  text-underline-offset: 4px;
}

.hider {
  border-radius: 10rem;
  font-size: 0.6rem;
  margin-left: 1rem;
}

#single-run-viewer {
  display: flex;
  flex-direction: row;
  background-color: cyan;
}

h5 {
  font-weight: bold;
  font-size: 18px;
}

h6 {
  font-size: 1.1rem;
}

.pieces {
  padding: 0rem 0rem;
  display: grid;
  width: 100%;
  grid-gap: 0rem;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto;
}

.measure {
  margin-top: 0.5rem;
}

.measure-buttons p {
  color: #596;
  margin-right: 1rem;
  font-size: 0.9rem;
  font-weight: bold;
}

.measure-buttons {
  padding-bottom: 0.5rem;
}

.pieces h3 {
  color: #667883;
  border-bottom: 1px solid #ddd;
  padding-bottom: 0.5rem;
  margin: 1rem 1rem 2rem 0rem;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.content {
  margin-top: 2rem;
  background-color: #eee;
}

.option-groups {
  width: 18rem;
  background-color: white;
  grid-row: 1 / 2;
  grid-column: 1 / 2;
  display: flex;
  flex-direction: column;
  padding-top: 1rem;
  z-index: 10;
  position: sticky;
  top: $navHeight;
}

.option-group {
  padding-bottom: 1rem;
}

.all-plots {
  grid-row: 1 / 2;
  grid-column: 2 / 3;
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.top-vega-plots {
  margin-top: 1rem;
}

.linear-plot {
  background-color: #f8f8f8;
  padding: 0.5rem 0.75rem 0.5rem 0.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  border: 1px solid #ccc;
}

.linear-plot.activity {
  background-color: white;
  padding: 0.5rem 0.75rem 0.5rem 0rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  border: none;
}

.top-vega-plot {
  background-color: #fff;
  border: none;
}

h5 {
  margin-top: 0.5rem;
}

.plotarea {
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 25rem;
}

.plotarea.tall {
  grid-template-rows: 29rem;
}

.plotarea.compact {
  grid-template-rows: 15rem;
}

.plotarea.activities {
  grid-template-rows: 18rem;
}

.plotsize {
  grid-row: 1 / 2;
  grid-column: 1 / 2;
}

p.plotsize {
  z-index: 10;
  margin: auto auto;
}

p.subhead {
  font-size: 0.9rem;
  margin-top: -0.25rem;
}

.plot {
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  padding: 1rem 0rem;
}

.plot-options {
  display: flex;
  flex-direction: row;
  margin-top: 2rem;
  margin-bottom: 0.3rem;
}

.infected {
  padding-left: 0.5rem;
  font-weight: bold;
  font-size: 2rem;
  color: rgb(151, 71, 34);
}

.button-choices {
  background-color: white;
  width: 100%;
  display: flex;
  flex-direction: row;
  margin-bottom: 0.25rem;
}

.button-choices button {
  margin-right: 2rem;
}

.title {
  line-height: 1.4rem;
  margin: 0.5rem 0 0.5rem 0;
}

.totally-disabled {
  pointer-events: none;
  opacity: 0.4;
}

.g1 {
  padding: 0rem 0.5rem 1rem 0.5rem;
  border-bottom: 1px solid #aaa;
  //border-radius: 4px;
}

.cumulative {
  padding-left: 0.5rem;
}

.page-section {
  padding: 0rem 3rem;
}

.base-choice {
  background-color: white;
  padding-top: 0;
  padding-bottom: 0;
}

.preamble {
  display: flex;
  flex-direction: row;
  padding-top: 1rem;
  padding-bottom: 0;
}

// could be deleted later
#single-run-viewer {
  display: flex;
  flex-direction: row;
  align-items: stretch;
}

.left-content {
  width: 300px;
  height: calc(100vh - $navAndBannerHeight);
  background-color: white;
  position: fixed;
}

.right-content {
  width: 100%;
  flex-grow: 1;
  overflow: auto;
  background: #eee;
  margin-left: 300px;
  width: calc(100vw - 300px);
  flex-grow: 1;
  height: calc(100vh - $navAndBannerHeight);
  background: #eee;
  position: fixed;
}

.side-menu {
  width: 100%;
  position: absolute;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
}

.menu-categorie {
  border-bottom-style: solid;
  border-right-style: solid;
  border-width: thin;
  border-color: #b5b5b5;
  max-height: calc(100% - 2rem);
}

.categorie-header {
  cursor: pointer;
  display: flex;
  height: 2rem;
  background-color: #eee;
}

.menu-arrow,
.menu-header {
  margin: 4px;
}

.menu-arrow {
  margin-left: 8px;
  height: min-content;
  margin-top: auto;
  margin-bottom: auto;
}

.plot-menu {
  cursor: pointer;
  display: flex;
  margin: 5px;
}

.allPlots:nth-child(even) {
  background-color: rgba(234, 234, 234, 0.5);
}

.plot-checkbox {
  margin-right: 15px;
  margin-left: 8px;
  height: min-content;
  margin-top: 5px;
}

.select-all-plots {
  display: flex;
}

.menu-button {
  width: 50%;

  margin: 10px;
}

.categorie-group {
  border-width: thin;
  padding-left: 8px;
  border-bottom-style: solid;
  border-color: #b5b5b5;
  border: none;
}

.categorie-content {
  flex: 1;
  max-height: calc(100% - 2rem);
  display: flex;
  flex-direction: column;
  border-top-style: solid;
  border-width: thin;
  border-color: #b5b5b5;
}

.scrollable {
  padding-top: 0.5rem;
  overflow: auto;
}

.footer p {
  line-height: 1.2rem;
  margin-top: 0.5rem;
  color: white;
}

.footer a {
  color: #043b26;
}

.footer img {
  margin: 1rem auto;
  padding: 0 1rem;
}

.left-side {
  display: flex;
  flex-direction: column;
  margin-right: 3rem;
}

.right-side {
  max-width: 60rem;
  margin: 0 auto;
  display: flex;
  flex: 1;
  flex-direction: column;
}

.right-side.wide-mode {
  max-width: none;
}

.results {
  display: flex;
  flex-direction: row;
  padding-top: 1rem;
  padding-bottom: 0;
}

.top-line-stats {
  display: flex;
  flex-direction: row;
  margin-left: auto;
}

.variation {
  display: flex;
  flex-direction: column;
  margin-left: auto;
  margin-bottom: 0.3rem;
  text-align: right;
}

.variation-choices {
  padding: 0 0;
}

.bottom {
  margin-bottom: 3rem;
}

.is-mobile-layout {
  display: none;
}

.is-desktop-layout {
  display: inherit;
}

.selections-and-charts {
  background-color: white;
  display: flex;
  flex-direction: row;
  padding-bottom: 2rem;
}

.readme {
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
}

.r-value-date {
  font-weight: bold;
  font-size: 1.1rem;
  margin-left: 0.1rem;
  border: 2px solid #ffffff00;
  border-radius: 6px;
  padding: 0.25rem 0.25rem;
}

.r-value-date:hover {
  border: 2px solid #4c5fb8;
}

.r-input {
  font-size: 1.1rem;
  margin: 8px;
  width: calc(100% - 16px);
}

.single-value-options {
  margin: 1rem 0.5rem;
}
.single-value-options table {
  font-size: 0.9rem;
}

.single-value-options {
  margin: 1rem 0.5rem;
}

.single-value-options table {
  font-size: 0.9rem;
}

.left-padding {
  padding-left: 0.5rem;
}

@media only screen and (max-width: 1024px) {
  .page-section {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .left-side {
    margin-right: 1rem;
  }

  .option-groups {
    width: 15rem;
  }
}

@media only screen and (max-width: 750px) {
  #single-run-viewer {
    flex-direction: column;
    background-color: white;
    //width: calc(100% + 15px);
    width: 100%;
    overflow: visible;
  }

  .side-menu {
    position: relative;
    top: 0;
    height: max-content;
    width: 100%;
    background-color: white;
  }

  .content {
    margin-top: 0rem;
  }

  .readme {
    padding-top: 1rem;
  }

  .left-content {
    margin: 0;
    width: 100%;
    position: static;
    height: min-content;
    background-color: white;
  }

  .right-content {
    margin: 0;
    width: 100%;
    position: static;
    height: max-content;
    background-color: white;
  }

  .linear-plot.activity {
    padding-right: 0.25rem;
  }

  .option-groups {
    width: 100%;
  }
  .left-side {
    margin-right: 0rem;
  }

  .right-side {
    margin: 0 0.5rem;
    max-width: none;
  }

  .selections-and-charts {
    flex-direction: column;
  }

  .option-group p {
    color: #596;
    padding-top: 0.5rem;
    margin-bottom: auto;
    margin-right: 1rem;
    font-size: 0.9rem;
    font-weight: bold;
  }

  .page-section {
    padding: 0 0.5rem;
  }

  td {
    margin-right: auto;
  }

  .preamble {
    padding-top: 1rem;
  }

  .content {
    padding: 0rem 1rem;
  }

  .all-plots {
    display: flex;
    flex-direction: column;
  }

  .plot-options {
    margin-left: 0;
  }

  p.infected {
    margin-bottom: 1rem;
  }

  .pieces {
    margin: 0 0;
    padding: 1rem 0rem;
    display: flex;
    flex-direction: column;
  }

  .linear-plot {
    margin-top: 0.5rem;
    margin-left: 0;
  }

  .results {
    padding-top: 2rem;
    flex-direction: column;
  }

  .top-line-stats {
    flex-direction: column;
  }
}
</style>

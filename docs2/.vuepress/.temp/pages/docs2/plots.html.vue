<template><div><h1 id="plots" tabindex="-1"><a class="header-anchor" href="#plots"><span>Plots</span></a></h1>
<p>The results of the runs are shown in the plots below. The following plots are available for visualization. The <code v-pre>RunId</code> describes the run currently selected via the buttons. Each run is contained as a .zip file in the summaries folder. The URL for the <code v-pre>PUBLIC_SVN</code> is: <a href="">https://svn.vsp.tu-berlin.de/repos/public-svn/matsim/scenarios/countries/de/episim</a></p>
<table>
<thead>
<tr>
<th>Plot name</th>
<th>Short name</th>
<th>File name</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="#activity-levels-by-type">Activity Levels by Type</a></td>
<td>actLevPerTyp</td>
<td>ActivityLevelsPlot</td>
</tr>
<tr>
<td><a href="#disease-import">Disease Import</a></td>
<td>disImp</td>
<td>DiseaseImport</td>
</tr>
<tr>
<td><a href="#hospitalization-new-cases-post-process">Hospitalization New Cases (post-process)</a></td>
<td>hosNewCasPos</td>
<td>PostHospital</td>
</tr>
<tr>
<td><a href="#hospitalization-rate-post-process">Hospitalization Rate (post-process)</a></td>
<td>hosRatPos</td>
<td>PostHospital</td>
</tr>
<tr>
<td><a href="#cases-comparison">Cases Comparison</a></td>
<td>casCom</td>
<td>WeeklyInfectionsPlot</td>
</tr>
<tr>
<td><a href="#virus-strains">Virus Strains</a></td>
<td>virStr</td>
<td>MutationsPlot</td>
</tr>
<tr>
<td><a href="#simulated-r-values">Simulated R-Values</a></td>
<td>simRVal</td>
<td>RValuePlot</td>
</tr>
<tr>
<td><a href="#simulated-r-values-by-purpose">Simulated R-Values by Purpose</a></td>
<td>simRValByPur</td>
<td>RValueTwo</td>
</tr>
<tr>
<td><a href="#infections-by-activity-type">Infections by Activity Type</a></td>
<td>infByActTyp</td>
<td>InfectionsByActivityType</td>
</tr>
<tr>
<td>Vaccine Effectiveness (against infection)</td>
<td>vacEffAgaInf</td>
<td>Vaccination<br/>EffectivenessPlot</td>
</tr>
<tr>
<td>Vaccine Effectiveness Vs. Strain</td>
<td>vacEffVsStr</td>
<td>VaccinationEffectiveness-<br/>VsStrain</td>
</tr>
<tr>
<td><a href="#incidence-comparison-between-vaccinated-and-unvaccinated-persons">Incidence comparison between vaccinated and unvaccinated persons</a></td>
<td>incComVacAndUnvac</td>
<td>WeeklyInfection-<br/>ByVaccination</td>
</tr>
<tr>
<td><a href="#vaccination-rates-and-booster-rates">Vaccination Rates and Booster Rates</a></td>
<td>VacRatBooRat</td>
<td>VaccinationRates</td>
</tr>
<tr>
<td><a href="#vaccination-per-type">Vaccination per Type</a></td>
<td>VacPerTyp</td>
<td>VaccinationPerType</td>
</tr>
<tr>
<td>Antibodies</td>
<td>Antibodies</td>
<td>Antibodies</td>
</tr>
<tr>
<td><a href="#hospitalization-new-cases">Hospitalization New Cases</a></td>
<td>hospNewCas</td>
<td>Hospitalization7-<br/>DayNewCasesPlot</td>
</tr>
<tr>
<td><a href="#hospitalization-rate-comparison">Hospitalization Rate Comparison</a></td>
<td>hospRatComp</td>
<td>HospitalizationPlot</td>
</tr>
<tr>
<td><a href="#hospitalization-rate-comparison-for-vaccinated-and-unvaccinated-persons">Hospitalization Rate Comparison for vaccinated and unvaccinated persons</a></td>
<td>hospRatCompVacAndUnvac</td>
<td>Hospitalization-<br/>VaccinationComparison</td>
</tr>
<tr>
<td><a href="#simulated-health-outcomes-over-time">Simulated Health Outcomes Over Time</a></td>
<td>simHealOutOveTim</td>
<td>HealthOutcomes</td>
</tr>
<tr>
<td><a href="#7-day-incidence-by-age-group-over-time-heatmap">7-Day Incidence by Age Group Over Time (Heatmap)</a></td>
<td>inciHeatmap</td>
<td>HeatMap</td>
</tr>
<tr>
<td><a href="#7-day-incidence-by-age-group-over-time-linechart">7-Day Incidence by Age Group Over Time (Linechart)</a></td>
<td>inciLinechart</td>
<td>AgeGroupLineChart</td>
</tr>
<tr>
<td><a href="#leisure-outdoor-fraction">Leisure Outdoor Fraction</a></td>
<td>leiOutFra</td>
<td>LeisureOutdoorFraction</td>
</tr>
<tr>
<td><a href="#weekly-tests">Weekly Tests</a></td>
<td>weekTest</td>
<td>WeeklyTests</td>
</tr>
</tbody>
</table>
<h2 id="activity-levels-by-type" tabindex="-1"><a class="header-anchor" href="#activity-levels-by-type"><span>Activity Levels by Type</span></a></h2>
<p><img src="@source/images/activity-levels-per-type.png" alt="Activity Levels by Type Plot"></p>
<p>Data basis: <code v-pre>RunId + '.restrictions.txt.csv'</code></p>
<h2 id="disease-import" tabindex="-1"><a class="header-anchor" href="#disease-import"><span>Disease Import</span></a></h2>
<p><img src="@source/images/disease-import.png" alt="Disease Import Plot"></p>
<p>Data basis: <code v-pre>RunId + '.diseaseImport.tsv'</code></p>
<h2 id="hospitalization-new-cases-post-process" tabindex="-1"><a class="header-anchor" href="#hospitalization-new-cases-post-process"><span>Hospitalization New Cases (post-process)</span></a></h2>
<p><img src="@source/images/hosp-new-cases.png" alt="Hospitalization New Cases (post-process) Plot"></p>
<p>Data basis: <code v-pre>RunId + '.post.hospital.tsv'</code></p>
<h2 id="hospitalization-rate-post-process" tabindex="-1"><a class="header-anchor" href="#hospitalization-rate-post-process"><span>Hospitalization Rate (post-process)</span></a></h2>
<p><img src="@source/images/hosp-rate.png" alt="Hospitalization Rate (post-process) Plot"></p>
<p>Data basis: <code v-pre>RunId + '.post.hospital.tsv'</code></p>
<h2 id="cases-comparison" tabindex="-1"><a class="header-anchor" href="#cases-comparison"><span>Cases Comparison</span></a></h2>
<p><img src="@source/images/case-comp.png" alt="DisCases Comparisonease Plot"></p>
<p>Data basis:</p>
<ul>
<li>Model data: <code v-pre>RunId + '.infections.txt.csv'</code>  <!-- - nShowingSymptomsCumulative column or if that is not present the difference from the Susceptible column. -->
</li>
<li>Sewage data: <code v-pre>PUBLIC_SVN + 'original-data/Abwasser/CologneSewageDataCleaned.csv'</code></li>
</ul>
<h2 id="virus-strains" tabindex="-1"><a class="header-anchor" href="#virus-strains"><span>Virus Strains</span></a></h2>
<p><img src="@source/images/virus-strains.png" alt="Virus Strains Plot"></p>
<p>Data basis:</p>
<ul>
<li>First plot: <code v-pre>PUBLIC_SVN + 'original-data/Fallzahlen/' + 'Cologne/VOC_Cologne_RKI.csv' respectively 'Berlin/VOC_Berlin.csv'</code></li>
<li>Second and third plot: <code v-pre>RunId + '.strains.tsv'</code></li>
</ul>
<p>Add new data:</p>
<ul>
<li>As soon as new variants for Cologne are available, they will be added automatically.</li>
<li>For the new variants only the name in the <a href="https://github.com/matsim-vsp/covid-sim/blob/master/src/views/v2/MutationsPlot.vue" target="_blank" rel="noopener noreferrer">file</a> has to be adjusted (headerCologne[] line 292)</li>
<li>In case new variants should not be displayed, the index must be added in the for loop (line 366) in the termination condition.</li>
</ul>
<h2 id="simulated-r-values" tabindex="-1"><a class="header-anchor" href="#simulated-r-values"><span>Simulated R-Values</span></a></h2>
<p><img src="@source/images/sim-r-values.png" alt="Simulated R-Values Plot"></p>
<p>Data basis: <code v-pre>RunId + '.infections.txt.csv'</code></p>
<h2 id="simulated-r-values-by-purpose" tabindex="-1"><a class="header-anchor" href="#simulated-r-values-by-purpose"><span>Simulated R-Values by Purpose</span></a></h2>
<p><img src="@source/images/r-values-by-purpose.png" alt="Simulated R-Values by Purpose Plot"></p>
<p>Data basis: <code v-pre>RunId + '.infections.txt.csv'</code></p>
<h2 id="infections-by-activity-type" tabindex="-1"><a class="header-anchor" href="#infections-by-activity-type"><span>Infections by Activity Type</span></a></h2>
<p><img src="@source/images/infection-by-activity-type.png" alt="Infections by Activity Type Plot"></p>
<p>Data basis: <code v-pre>RunId + '.infectionsPerActivity.txt.tsv'</code></p>
<h2 id="incidence-comparison-between-vaccinated-and-unvaccinated-persons" tabindex="-1"><a class="header-anchor" href="#incidence-comparison-between-vaccinated-and-unvaccinated-persons"><span>Incidence comparison between vaccinated and unvaccinated persons</span></a></h2>
<p><img src="@source/images/incidence-comp-vac-unvac.png" alt="Incidence comparison between vaccinated and unvaccinated persons Plot"></p>
<p>Data basis: <code v-pre>PUBLIC_SVN + 'original-data/Fallzahlen/RKI/' + e.g. 'cologne-cases.csv'</code></p>
<h2 id="vaccination-rates-and-booster-rates" tabindex="-1"><a class="header-anchor" href="#vaccination-rates-and-booster-rates"><span>Vaccination Rates and Booster Rates</span></a></h2>
<p><img src="@source/images/vac-rates-and-booster-rates.png" alt="Disease Plot"></p>
<p>Data basis: <code v-pre>RunId + '.vaccinationsDetailed.tsv'</code></p>
<h2 id="vaccination-per-type" tabindex="-1"><a class="header-anchor" href="#vaccination-per-type"><span>Vaccination per Type</span></a></h2>
<p><img src="@source/images/vac-per-type.png" alt="Vaccination Rates and Booster Rates Plot"></p>
<p>Data basis: <code v-pre>RunId + '.vaccinations.tsv'</code></p>
<h2 id="hospitalization-new-cases" tabindex="-1"><a class="header-anchor" href="#hospitalization-new-cases"><span>Hospitalization New Cases</span></a></h2>
<p><img src="@source/images/hosp-new-cases-old.png" alt="Hospitalization New Cases Plot"></p>
<p>Data basis: <code v-pre>RunId + '.infections.txt.csv'</code></p>
<h2 id="hospitalization-rate-comparison" tabindex="-1"><a class="header-anchor" href="#hospitalization-rate-comparison"><span>Hospitalization Rate Comparison</span></a></h2>
<p><img src="@source/images/hosp-rate-old.png" alt="Hospitalization Rate Comparison Plot"></p>
<p>Data basis: <code v-pre>RunId + '.infections.txt.csv'</code></p>
<h2 id="hospitalization-rate-comparison-for-vaccinated-and-unvaccinated-persons" tabindex="-1"><a class="header-anchor" href="#hospitalization-rate-comparison-for-vaccinated-and-unvaccinated-persons"><span>Hospitalization Rate Comparison for vaccinated and unvaccinated persons</span></a></h2>
<p><img src="@source/images/hosp-rate-vac-and-unvac.png" alt="Hospitalization Rate Comparison for vaccinated and unvaccinated persons Plot"></p>
<p>Data basis: <code v-pre>RunId + '.infections.txt.csv'</code></p>
<h2 id="simulated-health-outcomes-over-time" tabindex="-1"><a class="header-anchor" href="#simulated-health-outcomes-over-time"><span>Simulated Health Outcomes Over Time</span></a></h2>
<p><img src="@source/images/sim-health-outcome.png" alt="Simulated Health Outcomes Over Time Plot"></p>
<p>Data basis: <code v-pre>RunId + '.infections.txt.csv'</code></p>
<h2 id="_7-day-incidence-by-age-group-over-time-heatmap" tabindex="-1"><a class="header-anchor" href="#_7-day-incidence-by-age-group-over-time-heatmap"><span>7-Day Incidence by Age Group Over Time (Heatmap)</span></a></h2>
<p><img src="@source/images/heapmap.png" alt="7-Day Incidence by Age Group Over Time (Heatmap) Plot"></p>
<p>Data basis: <code v-pre>RunId + '.post.incidenceByAge.tsv'</code></p>
<h2 id="_7-day-incidence-by-age-group-over-time-linechart" tabindex="-1"><a class="header-anchor" href="#_7-day-incidence-by-age-group-over-time-linechart"><span>7-Day Incidence by Age Group Over Time (Linechart)</span></a></h2>
<p><img src="@source/images/incidence-by-age.png" alt="7-Day Incidence by Age Group Over Time (Linechart) Plot"></p>
<p>Data basis: <code v-pre>RunId + '.post.incidenceByAge.tsv'</code></p>
<h2 id="leisure-outdoor-fraction" tabindex="-1"><a class="header-anchor" href="#leisure-outdoor-fraction"><span>Leisure Outdoor Fraction</span></a></h2>
<p><img src="@source/images/leisure-outdoor-fraction.png" alt="Leisure Outdoor Fraction Plot"></p>
<p>Data basis: <code v-pre>RunId + '.outdoorFraction.tsv'</code></p>
<h2 id="weekly-tests" tabindex="-1"><a class="header-anchor" href="#weekly-tests"><span>Weekly Tests</span></a></h2>
<p><img src="@source/images/weekly-tests.png" alt="Weekly Tests Plot"></p>
<p>Data basis: <code v-pre>RunId + '.infections.txt.csv'</code></p>
</div></template>



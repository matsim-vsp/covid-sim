<template><div><h1 id="episim-outputs-and-analysis" tabindex="-1"><a class="header-anchor" href="#episim-outputs-and-analysis"><span>EpiSim - Outputs and Analysis</span></a></h1>
<p>All infections and disease state changes are documented by<br>
<code v-pre>EpisimReporting</code>. This class is used to produce the output files useful<br>
for analysis. One of the most important outputs created is<br>
<em>infections.txt</em>, which documents the infection state counts for each<br>
date and each county: e.g. number of individuals who are susceptible,<br>
infected but not contagious, contagious, seriously sick, recovered,<br>
quarantined, tested, vaccinated, etc. You may found a short description of the remaining standard outputs here:</p>
<table>
<thead>
<tr>
<th><strong>File name</strong></th>
<th><strong>File content</strong></th>
</tr>
</thead>
<tbody>
<tr>
<td>*.config.xml</td>
<td>The configuration options used to run the model</td>
</tr>
<tr>
<td>*.vaccinations.tsv</td>
<td>Number of vaccinations per vaccination supplier per day.</td>
</tr>
<tr>
<td>*.vaccinationsDetailed.tsv</td>
<td>Number of 1st/2nd/xth dosis per vaccination type (mRNA, vector, xbbupdate) per day.<sup class="footnote-ref"><a href="#footnote1">[1]</a><a class="footnote-anchor" id="footnote-ref1"></a></sup></td>
</tr>
<tr>
<td>*.diseaseImport.tsv</td>
<td>Number of infections per strain being imported into the model area on each day.</td>
</tr>
<tr>
<td>*.strains.tsv</td>
<td>Number of new infections per strain per day.</td>
</tr>
<tr>
<td>*.infections.txt.csv</td>
<td>Number of agents (differentiated by vaccination status) per disease state per day; cumulative numbers are also given. Also gives information on number of tested, quarantined and vaccinated individuals per day.</td>
</tr>
<tr>
<td>*.restrictions.txt.csv</td>
<td>Shows the remaining fraction, contact intensity correction<sup class="footnote-ref"><a href="#footnote2">[2]</a><a class="footnote-anchor" id="footnote-ref2"></a></sup> , and mask usage per activity type per day. Mask usage describes the cutoff points for different types of masks. E.g. <em>{NONE=0.1, CLOTH=0.55, SURGICAL=1.0}</em> indicates do not wear a mask, 45% wear a cloth mask, and 45% wear a surgical mask.</td>
</tr>
<tr>
<td>*.outdoorFraction.tsv</td>
<td>Share of user-configured activity types that are performed outside per day. This depends on the daily temperature.</td>
</tr>
</tbody>
</table>
<h2 id="visualization" tabindex="-1"><a class="header-anchor" href="#visualization"><span>Visualization</span></a></h2>
<p>Both infection dynamics and political discourse are in constant flux;<br>
for EpiSim to<br>
make an impact on decision-makers, the turnover must be rapid. Covid-Sim<br>
is a visualization tool that was developed to synthesize and plot the<br>
outputs of hundreds or thousands of simulations. The user simply uploads<br>
the output files to a server, and then can immediately visit a custom<br>
URL to see their results. The website is populated with an array of<br>
plots that show, e.g., incidence, hospitalizations, virus strains, and<br>
testing rates for a given scenario. Readers are encouraged to visit<br>
<a href="https://covid-sim.info" target="_blank" rel="noopener noreferrer">https://covid-sim.info</a> to view recent simulation results and read the<br>
corresponding reports. The code for covid-sim is open-source, allowing<br>
future users to recreate the system:<br>
<a href="https://github.com/matsim-vsp/covid-sim" target="_blank" rel="noopener noreferrer">https://github.com/matsim-vsp/covid-sim</a>. Documentation can be found<br>
here: <a href="https://covid-sim.info/docs/" target="_blank" rel="noopener noreferrer">https://covid-sim.info/docs/</a>.</p>
<hr class="footnotes-sep">
<section class="footnotes">
<ol class="footnotes-list">
<li id="footnote1" class="footnote-item"><p>This is the only output file that is not scaled to 100%. For a 25%<br>
scenario, this values need to be multiplied by four. <a href="#footnote-ref1" class="footnote-backref">↩︎</a></p>
</li>
<li id="footnote2" class="footnote-item"><p>For every activity type, there exists a baseline contact<br>
intensity. If activities are, for example, moved outside during the<br>
summer, then the contact intensity may manually be decreased. <a href="#footnote-ref2" class="footnote-backref">↩︎</a></p>
</li>
</ol>
</section>
</div></template>



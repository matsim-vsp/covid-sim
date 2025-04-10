<template><div><h1 id="configuration" tabindex="-1"><a class="header-anchor" href="#configuration"><span>Configuration</span></a></h1>
<p>Each run has a <code v-pre>config.yaml</code> file. In this file settings can be made. The following settings are possible:</p>
<h2 id="yaml-file" tabindex="-1"><a class="header-anchor" href="#yaml-file"><span>YAML File</span></a></h2>
<table>
<thead>
<tr>
<th>name</th>
<th>required</th>
<th>data type</th>
<th>description</th>
</tr>
</thead>
<tbody>
<tr>
<td>viewerVersion</td>
<td>false</td>
<td>number</td>
<td>There are several versions of covid-sim. The current version is 2. Possible versions are: 1 and 2.</td>
</tr>
<tr>
<td>city</td>
<td>true</td>
<td>string</td>
<td>Covid-sim can map data from different cities. Possible are: berlin and cologne.</td>
</tr>
<tr>
<td>info</td>
<td>true</td>
<td>string</td>
<td>Specifies the name of the file in which the run IDs are assigned to the settings.</td>
</tr>
<tr>
<td>readme</td>
<td>true</td>
<td>string</td>
<td>For the description to be displayed above the plots, the name of the Markdown file can be specified, which is located in the same folder as the YAML file.</td>
</tr>
<tr>
<td>zipFolder</td>
<td>true</td>
<td>string</td>
<td>For the data of the runs, the folder with the results can be specified here, which is located in the same folder as the YAML file.</td>
</tr>
<tr>
<td>timestamp</td>
<td>true</td>
<td>string</td>
<td>Specifies the date in the format <code v-pre>YYYY-MM-DD</code> on which the run was set up.</td>
</tr>
<tr>
<td>offset</td>
<td>false</td>
<td>number[]</td>
<td>desc...</td>
</tr>
<tr>
<td>startDate</td>
<td>false</td>
<td>string</td>
<td>Specifies the start date in the format <code v-pre>YYYY-MM-DD</code> when the run starts. One of the two values <code v-pre>startDate</code> and <code v-pre>defaultStartDate</code> must be set.</td>
</tr>
<tr>
<td>endDate</td>
<td>false</td>
<td>string</td>
<td>Specifies the start date in the format <code v-pre>YYYY-MM-DD</code> when the run ends.</td>
</tr>
<tr>
<td>defaultStartDate</td>
<td>false</td>
<td>string</td>
<td>One of the two values <code v-pre>startDate</code> and <code v-pre>defaultStartDate</code> must be set.</td>
</tr>
<tr>
<td>startDates</td>
<td>false</td>
<td>string[]</td>
<td>Are required if no <code v-pre>offset</code> has been specified.</td>
</tr>
<tr>
<td>ignoredPlots</td>
<td>false</td>
<td>string[]</td>
<td>Plots can be hidden for specific runs. For this purpose, the short name of the plot must be specified at this point. For the respective short names see: <RouteLink to="/documentation/plots.html#plots">Plots</RouteLink>.</td>
</tr>
<tr>
<td>graphStartDate</td>
<td>true</td>
<td>string</td>
<td>Specifies the date in the format <code v-pre>YYYY-MM-DD</code> when the plots start.</td>
</tr>
<tr>
<td>heatMapMaxValue</td>
<td>false</td>
<td>number</td>
<td>So that the results of different runs can be compared with the heatmap. A maximum value must be set, which can be adjusted here.</td>
</tr>
<tr>
<td>rValueDate</td>
<td>false</td>
<td>string</td>
<td>The date for the displayed R-value can be set in the format 'YYYY-MM-DD'. The default date is: <code v-pre>2020-10-15</code>.</td>
</tr>
<tr>
<td>optionGroups</td>
<td>true</td>
<td><a href="#optiongroups">optionGroups</a>[]</td>
<td>desc...</td>
</tr>
</tbody>
</table>
<h3 id="optiongroups" tabindex="-1"><a class="header-anchor" href="#optiongroups"><span>optionGroups</span></a></h3>
<table>
<thead>
<tr>
<th>name</th>
<th>required</th>
<th>data type</th>
<th>description</th>
</tr>
</thead>
<tbody>
<tr>
<td>day</td>
<td>false</td>
<td>number</td>
<td>desc...</td>
</tr>
<tr>
<td>heading</td>
<td>true</td>
<td>string</td>
<td>desc...</td>
</tr>
<tr>
<td>subheading</td>
<td>false</td>
<td>string</td>
<td>desc...</td>
</tr>
<tr>
<td>measures</td>
<td>true</td>
<td><a href="#measures">measures</a>[]</td>
<td>desc...</td>
</tr>
</tbody>
</table>
<h3 id="measures" tabindex="-1"><a class="header-anchor" href="#measures"><span>measures</span></a></h3>
<table>
<thead>
<tr>
<th>name</th>
<th>required</th>
<th>data type</th>
<th>description</th>
</tr>
</thead>
<tbody>
<tr>
<td>measure</td>
<td>true</td>
<td>string</td>
<td>desc...</td>
</tr>
<tr>
<td>title</td>
<td>true</td>
<td>string</td>
<td>desc...</td>
</tr>
<tr>
<td>order</td>
<td>false</td>
<td>string</td>
<td>desc...</td>
</tr>
<tr>
<td>options</td>
<td>false</td>
<td>number[]</td>
<td>desc...</td>
</tr>
<tr>
<td>asPercent</td>
<td>false</td>
<td>boolean</td>
<td>desc...</td>
</tr>
</tbody>
</table>
<h3 id="example" tabindex="-1"><a class="header-anchor" href="#example"><span>Example</span></a></h3>
<p>This is an example YAML file which belongs to this <a href="https://covid-sim.info/cologne/2022-11-16/3-variants" target="_blank" rel="noopener noreferrer">run</a>.</p>
<div class="language-yaml line-numbers-mode" data-highlighter="prismjs" data-ext="yml"><pre v-pre><code><span class="line"><span class="token punctuation">---</span></span>
<span class="line"><span class="token key atrule">readme</span><span class="token punctuation">:</span> notes.md</span>
<span class="line"><span class="token key atrule">zip</span><span class="token punctuation">:</span> summaries.zip</span>
<span class="line"><span class="token key atrule">info</span><span class="token punctuation">:</span> _info.txt</span>
<span class="line"><span class="token key atrule">zipFolder</span><span class="token punctuation">:</span> summaries</span>
<span class="line"><span class="token key atrule">timestamp</span><span class="token punctuation">:</span> <span class="token datetime number">2022-11-18</span></span>
<span class="line"><span class="token key atrule">viewerVersion</span><span class="token punctuation">:</span> <span class="token number">2</span></span>
<span class="line"><span class="token key atrule">city</span><span class="token punctuation">:</span> cologne</span>
<span class="line"><span class="token key atrule">runName</span><span class="token punctuation">:</span> calibration</span>
<span class="line"><span class="token key atrule">defaultStartDate</span><span class="token punctuation">:</span> <span class="token datetime number">2020-02-25</span></span>
<span class="line"><span class="token key atrule">graphStartDate</span><span class="token punctuation">:</span> <span class="token datetime number">2022-08-01</span></span>
<span class="line"><span class="token key atrule">endDate</span><span class="token punctuation">:</span> <span class="token datetime number">2024-09-30</span></span>
<span class="line"><span class="token key atrule">startDates</span><span class="token punctuation">:</span></span>
<span class="line"><span class="token punctuation">-</span> <span class="token datetime number">2020-02-25</span></span>
<span class="line"><span class="token key atrule">optionGroups</span><span class="token punctuation">:</span></span>
<span class="line"><span class="token punctuation">-</span> <span class="token key atrule">day</span><span class="token punctuation">:</span> <span class="token number">-1</span></span>
<span class="line">  <span class="token key atrule">heading</span><span class="token punctuation">:</span> <span class="token string">""</span></span>
<span class="line">  <span class="token key atrule">subheading</span><span class="token punctuation">:</span> <span class="token string">""</span></span>
<span class="line">  <span class="token key atrule">measures</span><span class="token punctuation">:</span></span>
<span class="line">  <span class="token punctuation">-</span> <span class="token key atrule">title</span><span class="token punctuation">:</span> Vac Camp</span>
<span class="line">    <span class="token key atrule">measure</span><span class="token punctuation">:</span> vacCamp</span>
<span class="line">  <span class="token punctuation">-</span> <span class="token key atrule">title</span><span class="token punctuation">:</span> Strain A</span>
<span class="line">    <span class="token key atrule">measure</span><span class="token punctuation">:</span> StrainA</span>
<span class="line">  <span class="token punctuation">-</span> <span class="token key atrule">title</span><span class="token punctuation">:</span> Strain A Date</span>
<span class="line">    <span class="token key atrule">measure</span><span class="token punctuation">:</span> strainADate</span>
<span class="line">  <span class="token punctuation">-</span> <span class="token key atrule">title</span><span class="token punctuation">:</span> Esc</span>
<span class="line">    <span class="token key atrule">measure</span><span class="token punctuation">:</span> esc</span>
<span class="line">  <span class="token punctuation">-</span> <span class="token key atrule">title</span><span class="token punctuation">:</span> Esc L</span>
<span class="line">    <span class="token key atrule">measure</span><span class="token punctuation">:</span> escL</span>
<span class="line">  <span class="token punctuation">-</span> <span class="token key atrule">title</span><span class="token punctuation">:</span> Ci Corr</span>
<span class="line">    <span class="token key atrule">measure</span><span class="token punctuation">:</span> ciCorr</span>
<span class="line">  <span class="token punctuation">-</span> <span class="token key atrule">title</span><span class="token punctuation">:</span> Days</span>
<span class="line">    <span class="token key atrule">measure</span><span class="token punctuation">:</span> days</span>
<span class="line">  <span class="token punctuation">-</span> <span class="token key atrule">title</span><span class="token punctuation">:</span> Strain Rnd</span>
<span class="line">    <span class="token key atrule">measure</span><span class="token punctuation">:</span> strainRnd</span>
<span class="line">  <span class="token punctuation">-</span> <span class="token key atrule">title</span><span class="token punctuation">:</span> Line B</span>
<span class="line">    <span class="token key atrule">measure</span><span class="token punctuation">:</span> lineB</span>
<span class="line">  <span class="token punctuation">-</span> <span class="token key atrule">title</span><span class="token punctuation">:</span> Iga</span>
<span class="line">    <span class="token key atrule">measure</span><span class="token punctuation">:</span> iga</span>
<span class="line">  <span class="token punctuation">-</span> <span class="token key atrule">title</span><span class="token punctuation">:</span> Seasonal</span>
<span class="line">    <span class="token key atrule">measure</span><span class="token punctuation">:</span> seasonal</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></div></template>



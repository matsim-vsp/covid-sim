<template><div><h1 id="matsim-episim" tabindex="-1"><a class="header-anchor" href="#matsim-episim"><span>MATSim Episim</span></a></h1>
<p><img src="https://github.com/matsim-org/matsim-episim-libs/workflows/build/badge.svg?branch=master" alt="Build Status"><br>
<img src="https://img.shields.io/github/license/matsim-org/matsim-episim.svg" alt="license"><br>
<img src="https://img.shields.io/badge/JDK-11+-green.svg" alt="JDK"><br>
<a href="https://gitter.im/matsim-episim-libs/community?utm_source=badge&amp;utm_medium=badge&amp;utm_campaign=pr-badge&amp;utm_content=badge" target="_blank" rel="noopener noreferrer"><img src="https://badges.gitter.im/matsim-episim-libs/community.svg" alt="Join the chat at https://gitter.im/matsim-episim-libs/community"></a></p>
<p>This repository contains an epidemic simulation based on MATSim, provided by the <a href="https://www.vsp.tu-berlin.de" target="_blank" rel="noopener noreferrer">Transport Systems Planning and Transport Telematics group</a> of <a href="https://www.tu-berlin.de" target="_blank" rel="noopener noreferrer">Technische Universität Berlin</a>.</p>
<p>Dissemination of some scenarios and results produced with the methods in this repository can be found at <a href="">https://matsim-vsp.github.io/covid-sim</a>.</p>
<p><a rel="TU Berlin" href="https://www.vsp.tu-berlin.de"><img src="https://svn.vsp.tu-berlin.de/repos/public-svn/ueber_uns/logo/TUB_Logo.png" width="15%" height="15%"/></a></p>
<h2 id="how-to-use-episim" tabindex="-1"><a class="header-anchor" href="#how-to-use-episim"><span>How to use Episim</span></a></h2>
<p>In order perform an epidemic simulation you first need an MATSim events file.<br>
To get started you can also use a provided event file from the <a href="https://svn.vsp.tu-berlin.de/repos/public-svn/matsim/scenarios/countries/de/berlin/berlin-v5.4-1pct-schools/output-berlin-v5.4-1pct-schools/berlin-v5.4-1pct-schools.output_events_for_episim.xml.gz" target="_blank" rel="noopener noreferrer">OpenBerlin Scenario</a>.</p>
<p>It is best to run the scenarios with your IDE from the <code v-pre>org.matsim.run</code> package.<br>
In <code v-pre>org.matsim.run.modules</code> you can find example scenarios that you may adapt or use to create your own configuration.</p>
<p>To run them you can create a standalone jar file with:</p>
<pre><code>mvn package
</code></pre>
<p>and run it with (where <code v-pre>OpenBerlinScenario</code> is the name of the scenario you want to run):</p>
<pre><code>java -jar matsim-episim-1.0-SNAPSHOT.jar --modules OpenBerlinScenario
</code></pre>
<h2 id="generating-mobility-traces-events-file" tabindex="-1"><a class="header-anchor" href="#generating-mobility-traces-events-file"><span>Generating mobility traces events file</span></a></h2>
<p>If you have a MATSim scenario you can also create your own event file to be used for an epidemic simulation.<br>
All that is needed is the population and the event file of one iteration.</p>
<p>Run <code v-pre>DownSampleScenario</code> to extract the necessary information:</p>
<div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java"><pre v-pre><code><span class="line">java <span class="token operator">-</span>jar matsim<span class="token operator">-</span>episim<span class="token operator">-</span><span class="token number">1.0</span><span class="token operator">-</span><span class="token constant">SNAPSHOT</span><span class="token punctuation">.</span>jar scenarioCreation downSample <span class="token number">0.1</span> <span class="token operator">--</span>population <span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Path</span> <span class="token keyword">to</span> plans<span class="token punctuation">.</span>xml<span class="token punctuation">></span></span> <span class="token operator">--</span>events <span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Path</span> <span class="token keyword">to</span> events<span class="token punctuation">.</span>xml<span class="token punctuation">></span></span></span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>This example will write a 10% sample into <code v-pre>output</code> that can be used in the subsequent steps.</p>
<h2 id="licenses" tabindex="-1"><a class="header-anchor" href="#licenses"><span>Licenses</span></a></h2>
<p>The <strong>MATSim program code</strong> in this repository is distributed under the terms of the <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noopener noreferrer">GNU Affero General Public License</a>. The MATSim program code are files that reside in the <code v-pre>src</code> directory hierarchy and typically end with <code v-pre>*.java</code>.</p>
<p>The <strong>MATSim input files, output files, analysis data and visualizations</strong> are licensed under a <a rel="license" href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>.<br>
<a rel="license" href="https://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by/4.0/80x15.png" /></a><br /> MATSim input files are those that are used as input to run MATSim. They often, but not always, have a header pointing to <a href="http://matsim.org" target="_blank" rel="noopener noreferrer">matsim.org</a>. They typically reside in the <code v-pre>scenarios</code> directory hierarchy. MATSim output files, analysis data, and visualizations are files generated by MATSim runs, or by postprocessing.  They typically reside in a directory hierarchy starting with <code v-pre>output</code>.</p>
<p><strong>Other data files</strong>, in particular in <code v-pre>original-input-data</code>, have their own individual licenses that need to be individually clarified with the copyright holders.</p>
<h2 id="more-information" tabindex="-1"><a class="header-anchor" href="#more-information"><span>More information</span></a></h2>
<p>For more information about the methodology and preliminary results, see VSP working paper <a href="">https://dx.doi.org/10.14279/depositonce-9835</a>.</p>
<p>For more information about MATSim, see here: <a href="">https://www.matsim.org</a>.</p>
</div></template>



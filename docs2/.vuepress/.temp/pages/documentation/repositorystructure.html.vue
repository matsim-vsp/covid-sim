<template><div><h1 id="episim-repository-structure" tabindex="-1"><a class="header-anchor" href="#episim-repository-structure"><span>EpiSim - Repository Structure</span></a></h1>
<p>There are three repositories on GitHub for<br>
EpiSim:</p>
<ul>
<li>
<p>matsim-episim - <a href="https://github.com/matsim-org/matsim-episim" target="_blank" rel="noopener noreferrer">https://github.com/matsim-org/matsim-episim</a>: This<br>
contains a runnable version of EpiSim using an open data model for the<br>
study area of Cologne. This repository is the recommended entry-point<br>
into EpiSim. It relies on matsim-episim-libs via a maven dependency.</p>
</li>
<li>
<p>matsim-episim-vsp - <a href="https://github.com/matsim-vsp/matsim-episim-vsp" target="_blank" rel="noopener noreferrer">https://github.com/matsim-vsp/matsim-episim-vsp</a>:<br>
This contains the run and analysis scripts used by<br>
VSP during the<br>
COVID-19<br>
pandemic. This repository can provide some valuable code examples;<br>
however, most of it relies on closed-source mobility data and<br>
therefore will not be runnable by users outside our project. It relies<br>
on matsim-episim-libs via a maven dependency.</p>
</li>
<li>
<p>matsim-episim-libs -<br>
<a href="https://github.com/matsim-org/matsim-episim-libs" target="_blank" rel="noopener noreferrer">https://github.com/matsim-org/matsim-episim-libs</a>: This contains the<br>
core code for the project which will be described in depth in the<br>
following passages. Users can fork this repository and modify core<br>
functionality for their needs (only recommended for experienced<br>
developers).</p>
</li>
</ul>
<p>We recommend every new user to download the matsim-episim repository;<br>
this is the best entry point.</p>
</div></template>



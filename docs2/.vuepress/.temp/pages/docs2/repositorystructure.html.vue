<template><div><h1 id="episim-repository-structure" tabindex="-1"><a class="header-anchor" href="#episim-repository-structure"><span>EpiSim - Repository Structure</span></a></h1>
<p>There are three repositories on GitHub for
EpiSim:</p>
<ul>
<li>
<p>matsim-episim - <a href="https://github.com/matsim-org/matsim-episim" target="_blank" rel="noopener noreferrer">https://github.com/matsim-org/matsim-episim</a>: This
contains a runnable version of EpiSim using an open data model for the
study area of Cologne. This repository is the recommended entry-point
into EpiSim. It relies on matsim-episim-libs via a maven dependency.</p>
</li>
<li>
<p>matsim-episim-vsp - <a href="https://github.com/matsim-vsp/matsim-episim-vsp" target="_blank" rel="noopener noreferrer">https://github.com/matsim-vsp/matsim-episim-vsp</a>:
This contains the run and analysis scripts used by
VSP during the
COVID-19
pandemic. This repository can provide some valuable code examples;
however, most of it relies on closed-source mobility data and
therefore will not be runnable by users outside our project. It relies
on matsim-episim-libs via a maven dependency.</p>
</li>
<li>
<p>matsim-episim-libs -
<a href="https://github.com/matsim-org/matsim-episim-libs" target="_blank" rel="noopener noreferrer">https://github.com/matsim-org/matsim-episim-libs</a>: This contains the
core code for the project which will be described in depth in the
following passages. Users can fork this repository and modify core
functionality for their needs (only recommended for experienced
developers).</p>
</li>
</ul>
<p>We recommend every new user to download the matsim-episim repository;
this is the best entry point.</p>
</div></template>



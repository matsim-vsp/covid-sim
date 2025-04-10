<template><div><h1 id="episim-introduction" tabindex="-1"><a class="header-anchor" href="#episim-introduction"><span>EpiSim - Introduction</span></a></h1>
<p>EpiSim is an agent-based epidemiological model used to track the development of<br>
COVID-19 cases<br>
and estimate the impact of various government-imposed mitigation<br>
strategies (<a href="https://doi.org/10.48550/arXiv.2011.11453" target="_blank" rel="noopener noreferrer">Müller 2020</a>). The first version was programmed in<br>
about two weeks in April 2020 by Fachgebiet Verkehrssystemplanung und Verkehrstelematik (VSP)---english: the Department of Transport<br>
Systems Planning and Transport Telematics---at the<br>
Technische Universität Berlin (TUB). Starting with<br>
the examination of the effect of school closures in March 2020, the<br>
VSP team regularly<br>
submitted reports on the effects of non-pharmaceutical interventions to the German Ministry of Education and<br>
Research until February 2024 (<a href="https://depositonce.tu-berlin.de/handle/11303/11125" target="_blank" rel="noopener noreferrer">MODUS-COVID consortium 2020-2024</a>).</p>
<p>EpiSim is<br>
well-situated to, in real time, address new outbreak situations and<br>
evaluate interventions due to its (1) data-driven and (2) agent-based<br>
nature. This allows the model to make up-to-date contributions to both<br>
the political and the scientific discourse.</p>
<ol>
<li>
<p>Many of the mechanics of EpiSim are directly fed by external data<br>
sources, including mobility, weather, mask-usage, and vaccination<br>
data. This means that the model can easily be kept current by<br>
updating the data sources.</p>
</li>
<li>
<p>The agent-based nature of EpiSim, as well as the mechanical infection<br>
model, allow non-pharmaceutical interventions to be modeled with<br>
relative ease. Furthermore, the interventions can be tuned to<br>
specific age-groups, or activity types.</p>
</li>
</ol>
<p>This user guide introduces the basic software structure of<br>
EpiSim,<br>
delineates what data is necessary to run a simulation, and what outputs<br>
are produced. This guide aims to introduce<br>
EpiSim to<br>
epidemiological modeling community such that<br>
EpiSim could be<br>
useful during future infectious disease outbreaks. Since<br>
EpiSim was<br>
created for COVID-19 and using the data available to our<br>
department, it won't be 1-to-1 applicable to other contexts; however, we<br>
hope that with some coding background, EpiSim can be reworked for a new epidemiological<br>
situation (the code is modular, meaning that classes can easily be<br>
replaced with alternate implementations). Or, future users can gut<br>
EpiSim, and use<br>
the components they need in their modeling framework. The following<br>
guide will focus on the general framework; we will use footnotes to<br>
comment on our department's implementations of certain functionalities.</p>
</div></template>



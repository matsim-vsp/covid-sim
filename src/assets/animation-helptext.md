<img src="./images/banner.jpg" height=50 >

### Episim: COVID-19 virus spreading dynamics

This animation illustrates how the [MATSIM-Episim model](https://matsim-vsp.github.io) simulates the spread of COVID-19 disease through Berlin, Germany and the surrounding area.

### What am I looking at?

Each colored dot represents a person as they go about their day. The colors show their disease status, as they contract and develop the disease in stages:

<div style="display: flex; flex-direction: column; margin-bottom: 1rem;">

<p style="margin-bottom: 0.4rem;"><span style="background-color: rgb(200,200,0)">&nbsp;&nbsp;&nbsp;&nbsp;</span> Susceptible and healthy</p>

<p style="margin-bottom: 0.4rem;"><span style="background-color: rgb(48,255,255)">&nbsp;&nbsp;&nbsp;&nbsp;</span>
    Infected but not contagious</p>

<p style="margin-bottom: 0.4rem;"><span style="background-color: rgb(200,0,50)">&nbsp;&nbsp;&nbsp;&nbsp;</span>
    Contagious</p>

<p style="margin-bottom: 0.4rem;"><span style="background-color: rgb(255,0,255)">&nbsp;&nbsp;&nbsp;&nbsp;</span>
    Showing Symptoms</p>

<p style="margin-bottom: 0.4rem;"><span style="background-color: rgb(128,0,128)">&nbsp;&nbsp;&nbsp;&nbsp;</span>
    Seriously Sick</p>

<p style="margin-bottom: 0.4rem;"><span style="background-color: rgb(50,50,50)">&nbsp;&nbsp;&nbsp;&nbsp;</span>
    Critical</p>

<p style="margin-bottom: 0.4rem;"><span style="background-color: rgb(160,250,160)">&nbsp;&nbsp;&nbsp;&nbsp;</span>
    Recovered</p>

</div>

You can select **different days** to see how the population's health shifts over time, or watch the daily interactions as each individual day progresses and people perform their daily activities and travel.

This is a "Base Case" simulation for illustrative purposes. It shows what would have happened in Berlin if there had been no social distancing measures, no closing of schools and workplaces, etc.

This illustration shows only a small sample of the total tripmaking in Berlin; while MATSim-Episim can model each agent individually, it is too much data to show on one screen in disaggregate form.

### How does the simulation work?

The method used by MATSIM-Episim is available on the front page at <https://matsim-vsp.github.io>. It is based on advanced human mobility models and virus infection dynamics taken from recent literature and publications.

### For more information

Please email us at [covid19@vsp.tu-berlin.de](mailto:covid19@vsp.tu-berlin.de) for more information.

The main website is at [matsim-vsp.github.io](https://matsim-vsp.github.io) is under heavy development as we build new versions of the Episim model.

MATSim-Episim is freely available and open source, and can be downloaded at <https://github.com/matsim-org/matsim-episim>.

### Acknowledgements

This site and the MATSim-Episim model are developed at Technische Universität Berlin, by the Transport Systems Planning and Transport Telematics group, Institute for Land and Sea Transport (ILS) at TU Berlin. Professor Kai Nagel leads the team.

This research supported by the [Bundesministerium für Bildung und Forschung](https://bmbf.de) at the German Federal Goverment.

Website and visulations built using [Vue](https://vuejs.org) and [Three.js](https://threejs.org).

<hr>

<img src="./images/matsim-logo-blue.png" width="40%">

<br/>
<br/>

<img src="./images/tu-logo.png" width="40%">

<br/>
<br/>
<br/>
<br/>

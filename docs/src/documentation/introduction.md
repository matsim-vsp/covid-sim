# EpiSim - Introduction 

EpiSim is an agent-based epidemiological model used to track the development of
COVID-19 cases
and estimate the impact of various government-imposed mitigation
strategies ([Müller 2020](
https://doi.org/10.48550/arXiv.2011.11453)). The first version was programmed in
about two weeks in April 2020 by Fachgebiet Verkehrssystemplanung und Verkehrstelematik (VSP)---english: the Department of Transport
Systems Planning and Transport Telematics---at the
Technische Universität Berlin (TUB). Starting with
the examination of the effect of school closures in March 2020, the
VSP team regularly
submitted reports on the effects of non-pharmaceutical interventions to the German Ministry of Education and
Research until February 2024 ([MODUS-COVID consortium 2020-2024](https://depositonce.tu-berlin.de/handle/11303/11125)).

EpiSim is
well-situated to, in real time, address new outbreak situations and
evaluate interventions due to its (1) data-driven and (2) agent-based
nature. This allows the model to make up-to-date contributions to both
the political and the scientific discourse.

1.  Many of the mechanics of EpiSim are directly fed by external data
    sources, including mobility, weather, mask-usage, and vaccination
    data. This means that the model can easily be kept current by
    updating the data sources.

2.  The agent-based nature of EpiSim, as well as the mechanical infection
    model, allow non-pharmaceutical interventions to be modeled with
    relative ease. Furthermore, the interventions can be tuned to
    specific age-groups, or activity types.

This user guide introduces the basic software structure of
EpiSim,
delineates what data is necessary to run a simulation, and what outputs
are produced. This guide aims to introduce
EpiSim to
epidemiological modeling community such that
EpiSim could be
useful during future infectious disease outbreaks. Since
EpiSim was
created for COVID-19 and using the data available to our
department, it won't be 1-to-1 applicable to other contexts; however, we
hope that with some coding background, EpiSim can be reworked for a new epidemiological
situation (the code is modular, meaning that classes can easily be
replaced with alternate implementations). Or, future users can gut
EpiSim, and use
the components they need in their modeling framework. The following
guide will focus on the general framework; we will use footnotes to
comment on our department's implementations of certain functionalities.
# EpiSim - Repository Structure

There are three repositories on GitHub for
EpiSim:

- matsim-episim - <https://github.com/matsim-org/matsim-episim>: This
  contains a runnable version of EpiSim using an open data model for the
  study area of Cologne. This repository is the recommended entry-point
  into EpiSim. It relies on matsim-episim-libs via a maven dependency.

- matsim-episim-vsp - <https://github.com/matsim-vsp/matsim-episim-vsp>:
  This contains the run and analysis scripts used by
  VSP during the
  COVID-19
  pandemic. This repository can provide some valuable code examples;
  however, most of it relies on closed-source mobility data and
  therefore will not be runnable by users outside our project. It relies
  on matsim-episim-libs via a maven dependency.

- matsim-episim-libs -
  <https://github.com/matsim-org/matsim-episim-libs>: This contains the
  core code for the project which will be described in depth in the
  following passages. Users can fork this repository and modify core
  functionality for their needs (only recommended for experienced
  developers).

We recommend every new user to download the matsim-episim repository;
this is the best entry point.
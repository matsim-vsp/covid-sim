# Simulation Setup

At the beginning of an EpiSim simulation, various input files must be
imported and the settings must be configured. Doing this manually for
each simulation would be work-intensive and prone to human-error. Thus,
each study area has a separate class, a so-called "production scenario,"
which sets all the regionally applicable input files and default
configuration values. For instance, the school vacation periods are
different for Berlin and Cologne (the class
`SnzBerlinProductionScenario` is used for Berlin). The following
subsection describes the input files that the production scenario reads
before the simulation begins. Afterward, the data structure containing
the configuration options---episim-config---is introduced, followed by
the way in which activity reductions are configured.

## Inputs

The essential input files for any EpiSim simulation are:

- **Population Input:** EpiSim has agents that move around the study
  area, and meet in facilities to complete activities (where there
  exists the chance of infection). Within the production scenario, a
  population file is imported that contains the demographic information
  for every individual simulated in EpiSim. In the standard Cologne model, this
  includes age, sex, and details of their home: longitude and latitude,
  facility ID, and county. The ability to integrate this demographic
  information into the simulation makes this ABM powerful; e.g., for age-prioritized
  vaccine distribution strategies, the age of an individual is read from
  the population file to determine eligibility.

- **Facilities Input:** Similarly, the facilities file enriches the
  model by providing information about each activity location: the
  longitude and latitude, as well as information about what activities
  can occur at that location.

- **Events Files:** Vital to EpiSim is the mobility behavior of
  individuals; this information is contained in so-called "events"
  files. The format of the events file follows the standard set by the
  MATSim output events files (see below for a depiction of an exemplary events file). Users can, however, create map
  mobility data from other sources (i.e. travel diaries). If an agent
  travels per public transit, the model knows when they got on and off
  the vehicle and the ID of that vehicle. When the agent conducts an
  activity, the activity type (e.g. home, leisure, work), the activity
  location, and the timeframe are accessible to the model. During the
  simulation, the contact model may use this information to detail all
  contacts between individuals, whether in a bus or in a university
  class. Within the events files, IDs of the corresponding agent,
  activity facility, or public transit vehicle are specified. These IDs
  can be matched to the population and facilities files, to extract
  pertinent information.\
  If the user specifies only a single events file, then it is assumed
  that the agent has the exact same daily plan for every day of the
  year. However, depending on the level of detail of the user's data,
  multiple events files may also be included[^1].

  ![Example Image](./../images/traj2.png)
  *Example Trajectories of three agents (Toby, Lily, and Sam), in which agents spend time in the same spaces (in a bus, or in school, in this example).*

- **Activity Reduction:** While the events files provide the typical
  daily plans of agents, an activity reduction input is required to
  decrease mobility during the COVID-19 pandemic (or a potential future
  outbreak). This dataset specifies what percentage of activities of a
  specific type take place on a given day. As will be shown in
  *background-policy*, these activity reductions will be
  incorporated into the `Restrictions` for certain activity types[^2].

ADD FIGURE HERE

Optional inputs for an EpiSim simulation are:

- **Temperature.** Temperature influences whether individuals
  (partially) perform their activities outside. Daily temperature data
  (from [Meteostat](https://meteostat.net/en/)) is read in and converted to the so-called
  "outdoor fraction" (see [Mueller 2021](http://dx.doi.org/10.1371/journal.pone.0259037), [Paltra 2024](http://dx.doi.org/10.1038/s41598-024-64230-1) for details on
  outdoor fraction).

- **Vaccination Quotas.** In Germany, the Robert Koch Insitute (RKI) reported the daily number of
  COVID-19
  vaccinations from December 26h, 2020 until July 9th, 2024. The number
  of vaccinations per day in the model follows these official
  vaccination numbers (see
  *Vaccination Model*).

- **Mask Usage.** Mask files provide the compliance to mask mandates on
  public transport. The model agents comply to these mandates at the
  same rates.

- **Disease Import.** Disease import files include the number of
  infections that are imported into the model area. As of now, disease
  import is dominated by individuals returning from their travels at the
  end of the school holidays. However, disease import could also include
  import from alternative national geographical areas.

## EpiSim Configuration

EpiSim is
designed to be extensively configurable and extendable. The class
`EpiSimConfigGroup` specifies most of the aspects of
EpiSim that can
be configured by the user. Based on this class, a container called the
episim-config is created, which holds the parameters and options
selected for a given run. It includes parameters relevant to simulation
mechanics, such as the simulation start-date and what outputs should be
produced. It also includes parameters relevant to infection dynamics,
including susceptibility and
infectivity.
Infectivity
describes the degree to which the infectious host can transmit the
disease while susceptibility describes the likelihood for the
susceptible agent to contract the disease ([Barreto 2006](https://doi.org/10.1136/jech.2003.011593)).
These parameters are configured in the episim-config container for
different age groups. The episim-config also specifies how many
individuals are infected with SARS-CoV-2 at the beginning of the
simulation.

Nested within the episim-config are the progression and policy configs.
The progression-config (see
*progressionModel*) specifies the transition probabilities
between different disease states: i.e. what percent of young adults will
become "seriously sick\" after "showing symptoms\" for 4 days. It also
includes the policy-config, which specifies how restrictions will be
applied to the population throughout the simulation (see *progressionModel*).

## Policy

As noted above, the episim-config contains a policy-config, which
specifies how activity restrictions are applied to the population
throughout the simulation. We first describe the *Restriction*, a basic
data structure that contains activity reduction information. Thereafter,
we describe the default restriction policy: *FixedPolicy*.

**Restriction:** The activity reduction information is stored in a data
structure called `Restriction`. One `Restriction` container is
applicable to one activity type[^3]. Within the `Restriction`, the
`remainingFraction` field dictates what percentage of activities take
place that day. For example, on a given day, the `remainingFraction` for
work activities could be 66%, meaning that one third of work events are
skipped. The `Restriction` container also contains information on mask
usage---what percent of people wear what type of mask---maximum group
sizes, whether activities locations close early or are closed
altogether. The policy-config specifies how the `Restriction` container
is filled. The `remainingFraction`s are based on the input data (see
activity reductions, above).

[^1]: **VSP Implementation**: VSP uses three event files: a typical
    weekday, a typical Saturday, and a typical Sunday. In a week, the
    weekday events are replayed five times (Monday -- Friday), followed
    by a single run through of the Saturday and Sunday events
    respectively.

[^2]: **VSP Implementation**: Every day during the
    COVID-19
    pandemic, VSP
    was provided with mobility data from cell-phone providers. The
    information includes the number and average duration of activities
    (for various activity types) that residents of a given zip-code
    complete on a given day. The class `AnalyzeSnzData` aggregates this
    data for a given study area, and calculates the daily activity
    reductions, as compared to a pre-COVID-19 baseline.

[^3]: **VSP Implementation**: In our case, it was sufficient to
    aggregate the mobility reductions such that the `Restriction` is
    applied for one week. This time-frame could also be shortened, e.g.
    to apply different reductions for holidays.
# EpiSim Simulation

So far, the scenario preparation process has been described; the
episim-config data structure, the various inputs, and the restriction
policies have been detailed. Now, it is time for the simulation to
begin. At the beginning of the simulation, a random set of individuals
is infected. The class `EpisimRunner` iterates through all the days
(iterations) in the simulation. As previously mentioned, in the VSP
case, one simulated week involves replaying the weekday events five
times, followed by the Saturday events and, finally, the Sunday events.

At the beginning of each day, there is a certain initialization phase:
e.g. vaccinations and tests are administered to portions of the
population. This is also where the disease progression model changes the
disease states of individuals (see *progressionModel*). Based on transition probabilities, some
infectious individuals start, for example, to show symptoms or some
seriously sick individuals recover.

At the beginning of a day, the `DefaultParticipationModel` ascertains
which activities should be skipped. Since the events file corresponds to
pre-coronavirus activity trajectories, a certain portion of planned
daily activities should be removed due to pandemic-induced mobility
reductions. For each event in the day's events file, the applicable
`remainingFraction` is extracted from the `Restriction` for the activity
type and date in question. A random number between 0.0 and 1.0 is then
generated; if it lies above the `remainingFraction`, then the activity
will not occur on this day. Thus, for a `remainingFraction` of 66% at
work, approximately one-third of all work activities for that day will
not occur. If an activity is skipped, then the associated public transit
travel to (and from) that activity will also not be realized.

Each day is simulated as follows: the corresponding events file is
replayed minute-by-minute, by processing the events chronologically.
EpiSim predicts
daily infection dynamics using three interlocking sub-models: the
contact model identifies situations where agents meet; given an agent is
infectious, the infection model predicts whether
SARS-CoV-2 is transmitted
to a susceptible agent; if an agent is infected, the disease progression
model determines the course and severity of the disease
([Müller 2020](
https://doi.org/10.48550/arXiv.2011.11453)). Following, these three core models will be
introduced, as well as two optional submodels: the vaccination and
antibody models.

## Contact Model

The `DefaultContactModel` starts the day with a set of empty containers,
corresponding to all the enclosed spaces where agents can meet (activity
facilities and public transit vehicles). The `ReplayHandler` class then
replays all the events that occur in a day in chronological order.

If an activity occurs (as specified by the `DefaultParticipationModel`),
the `DefaultContactModel` will then add the agent in question to the
corresponding container. When the events file specifies that an agent
ends an activity, the `DefaultContactModel` checks whether at least one
person in the container is susceptible and one is infectious. If so,
this agent-pair is passed along to the `InfectionEventHandler`, which
will check whether an infection actually occurs. This same process also
occurs when an agents enters or leaves a public transit vehicle
([Müller 2020](
https://doi.org/10.48550/arXiv.2011.11453)).

## Infection Model

If the contact model renders that a contagious person met with a
susceptible person, then the infection model calculates the probability
that an infection occurs. EpiSim uses a mechanical infection model (
[Smieszek 2009](https://doi.org/10.1186/1742-4682-6-25), [Smieszek 2011](https://doi.org/10.1186/1471-2334-11-115))[^1]. The
following is a simplified model version, which is useful for explanatory
purposes:

$$p(\mbox{infect}|\mbox{contact}) \approx \Theta \times sh \times ci \times in \times \tau$$

Here, the "shedding rate\", $sh$, is the viral load that the infected
person produces through exhalation; this is dependent on what stage of
the disease the person is in and whether they are wearing a mask.
Conversely, the "intake rate\", $in$, is how much viral load a
susceptible agent breathes in, which is also dependent on mask-usage.
Age-dependent susceptibility and
infectivity, which were defined in the episim-config,
also play a role in the shedding and intake rates. The "contact
intensity\", $ci$, describes the aerodynamic characteristics of the
room, which impact the viral load, including size of the room and how
much air exchange takes place (i.e. through the opening of windows).
Finally, the duration of contact $\tau$ is an important factor, which
can be gleaned from the activity trajectories. The calibration factor,
$\Theta$, is determined through model calibration; this also absorbs all
units of the individual factors. All of this together predicts whether
susceptible individuals become infected with SARS-CoV-2 during an
interaction with an infectious person. For additional details, see
([Müller 2020](
https://doi.org/10.48550/arXiv.2011.11453)).

## Disease Progression Model

After an agent is infected with SARS-CoV-2, the disease progression
model is used to determine if COVID-19 develops and if (and when) certain
disease stages occur. When the infection model reports that a
`susceptible` person is infected, the agent is initially assigned the
state of `infectedButNotContagious`. At the beginning of each iteration
(simulated day), there will be a certain chance for the infection state
of the agent to change. The worst
possible progression would be as follows:
`infectedButNotContagious` → `infectious`
→ `showingSymptoms` → `seriouslySick` → `critical` → `seriouslySick` → `recovered`[^2]. However, starting with the
`infectious` state, there is always a chance of becoming `recovered`.

ADD FIGURE HERE

The progression model uses age-dependent transition probabilities to
determine whether the agent moves to a more dire state or to the
`recovered` state. The progression model also sets the duration of each
state based on medians and standard deviations found in the literature.
The agent can only infect other agents in the infectious state or within
the first few days of the showing symptoms state; in later states, it is
assumed that the agent is either isolating at home or in the hospital.
Readers who would like more information on the sources of the transition
probabilities are encouraged to read Section 2.3 of
([Müller 2020](
https://doi.org/10.48550/arXiv.2011.11453)).

## Vaccination Model

Historical vaccinations, which are administered to a portion of the
population at the beginning of each day, are implemented in
`VaccinationFromData`. To accurately represent the vaccination quotas
per age group and manufacturer shares in EpiSim, the model adheres to
the official German vaccination quotas and manufacturer shares provided
by [rki](https://doi.org10.5281/zenodo.12697471); thus ensuring alignment with the actual
distribution within the German population. RKI provides the number of vaccinations per
date for four age groups (5-11, 12-7, 18-59 and 60+ years old) on the
county level and the number of vaccinations per manufacturer (i.e.
Comirnaty, Spikevax, Vaxzevria) on the federal state level. In EpiSim,
agents are divided into the same age groups. However, only agents who
are a) `susceptible`, b) have not been vaccinated in the previous 90
days, and c) have not been infected during the previous 90 days are
eligible for vaccination. For the booster vaccine, agents must
additionally have already been vaccinated to be considered eligible, and
for the second booster, agents must have already been boostered to be
considered eligible. Per age group and per manufacturer, the available
doses per manufacturer are then randomly given to the eligible agents.
For each agent, the latest vaccination date, the number of vaccinations
as well as the vaccination type they received are saved[^3].

## Antibody Model

Antibody levels of individual agents are implemented in
`DefaultAntibodyModel`. After the first immunization event (either
vaccination or infection), an agent's strain-specific antibody levels
are set. A relative antibody level of 0 translates to no protection,
while a relative antibody level of 1 translates to 50% protection
against infection. However, these antibody levels are dynamic and may,
due to waning, decrease over time. An additional immunization event,
either via infection or via vaccination, is necessary to boost the
agent's antibody levels again. For a detailed discussion of
EpiSim's
antibody model see [Müller 2023](http://dx.doi.org/10.1016/j.isci.2023.107554).

[^1]: The equation used in [episim]{acronym-label="episim"
    acronym-form="singular+short"} to calculate the probability of
    infection along with a detailed explanation can be found in
    ([Müller 2020](https://doi.org/10.48550/arXiv.2011.11453)).

[^2]: There is no death in Episim.

[^3]: If current vaccination data is unavailable or if future
    developers/users decide not to follow the vaccination quotas
    provided by RKI, alternative vaccination strategies may be
    implemented.
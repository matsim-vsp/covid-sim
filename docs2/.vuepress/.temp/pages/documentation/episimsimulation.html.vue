<template><div><h1 id="episim-simulation" tabindex="-1"><a class="header-anchor" href="#episim-simulation"><span>EpiSim - Simulation</span></a></h1>
<p>So far, the scenario preparation process has been described; the<br>
episim-config data structure, the various inputs, and the restriction<br>
policies have been detailed. Now, it is time for the simulation to<br>
begin. At the beginning of the simulation, a random set of individuals<br>
is infected. The class <code v-pre>EpisimRunner</code> iterates through all the days<br>
(iterations) in the simulation. As previously mentioned, in the VSP<br>
case, one simulated week involves replaying the weekday events five<br>
times, followed by the Saturday events and, finally, the Sunday events.</p>
<p>At the beginning of each day, there is a certain initialization phase:<br>
e.g. vaccinations and tests are administered to portions of the<br>
population. This is also where the disease progression model changes the<br>
disease states of individuals (see <em><a href="#disease-progression-model">Disease Progression Model</a></em>). Based on transition probabilities, some<br>
infectious individuals start, for example, to show symptoms or some<br>
seriously sick individuals recover.</p>
<p>At the beginning of a day, the <code v-pre>DefaultParticipationModel</code> ascertains<br>
which activities should be skipped. Since the events file corresponds to<br>
pre-coronavirus activity trajectories, a certain portion of planned<br>
daily activities should be removed due to pandemic-induced mobility<br>
reductions. For each event in the day's events file, the applicable<br>
<code v-pre>remainingFraction</code> is extracted from the <code v-pre>Restriction</code> for the activity<br>
type and date in question. A random number between 0.0 and 1.0 is then<br>
generated; if it lies above the <code v-pre>remainingFraction</code>, then the activity<br>
will not occur on this day. Thus, for a <code v-pre>remainingFraction</code> of 66% at<br>
work, approximately one-third of all work activities for that day will<br>
not occur. If an activity is skipped, then the associated public transit<br>
travel to (and from) that activity will also not be realized.</p>
<p>Each day is simulated as follows: the corresponding events file is<br>
replayed minute-by-minute, by processing the events chronologically.<br>
EpiSim predicts<br>
daily infection dynamics using three interlocking sub-models: the<br>
contact model identifies situations where agents meet; given an agent is<br>
infectious, the infection model predicts whether<br>
SARS-CoV-2 is transmitted<br>
to a susceptible agent; if an agent is infected, the disease progression<br>
model determines the course and severity of the disease<br>
(<a href="https://doi.org/10.48550/arXiv.2011.11453" target="_blank" rel="noopener noreferrer">Müller 2020</a>). Following, these three core models will be<br>
introduced, as well as two optional submodels: the vaccination and<br>
antibody models.</p>
<h2 id="contact-model" tabindex="-1"><a class="header-anchor" href="#contact-model"><span>Contact Model</span></a></h2>
<p>The <code v-pre>DefaultContactModel</code> starts the day with a set of empty containers,<br>
corresponding to all the enclosed spaces where agents can meet (activity<br>
facilities and public transit vehicles). The <code v-pre>ReplayHandler</code> class then<br>
replays all the events that occur in a day in chronological order.</p>
<p>If an activity occurs (as specified by the <code v-pre>DefaultParticipationModel</code>),<br>
the <code v-pre>DefaultContactModel</code> will then add the agent in question to the<br>
corresponding container. When the events file specifies that an agent<br>
ends an activity, the <code v-pre>DefaultContactModel</code> checks whether at least one<br>
person in the container is susceptible and one is infectious. If so,<br>
this agent-pair is passed along to the <code v-pre>InfectionEventHandler</code>, which<br>
will check whether an infection actually occurs. This same process also<br>
occurs when an agents enters or leaves a public transit vehicle<br>
(<a href="https://doi.org/10.48550/arXiv.2011.11453" target="_blank" rel="noopener noreferrer">Müller 2020</a>).</p>
<h2 id="infection-model" tabindex="-1"><a class="header-anchor" href="#infection-model"><span>Infection Model</span></a></h2>
<p>If the contact model renders that a contagious person met with a<br>
susceptible person, then the infection model calculates the probability<br>
that an infection occurs. EpiSim uses a mechanical infection model (<br>
<a href="https://doi.org/10.1186/1742-4682-6-25" target="_blank" rel="noopener noreferrer">Smieszek 2009</a>, <a href="https://doi.org/10.1186/1471-2334-11-115" target="_blank" rel="noopener noreferrer">Smieszek 2011</a>)<sup class="footnote-ref"><a href="#footnote1">[1]</a><a class="footnote-anchor" id="footnote-ref1"></a></sup>. The<br>
following is a simplified model version, which is useful for explanatory<br>
purposes:</p>
<p><em>p(infect|contact) ≈ Θ × sh × ci × in × τ.</em></p>
<p>Here, the &quot;shedding rate&quot;, <em>sh</em>, is the viral load that the infected<br>
person produces through exhalation; this is dependent on what stage of<br>
the disease the person is in and whether they are wearing a mask.<br>
Conversely, the &quot;intake rate&quot;, <em>in</em>, is how much viral load a<br>
susceptible agent breathes in, which is also dependent on mask-usage.<br>
Age-dependent susceptibility and<br>
infectivity, which were defined in the episim-config,<br>
also play a role in the shedding and intake rates. The &quot;contact<br>
intensity&quot;, <em>ci</em>, describes the aerodynamic characteristics of the<br>
room, which impact the viral load, including size of the room and how<br>
much air exchange takes place (i.e. through the opening of windows).<br>
Finally, the duration of contact <em>τ</em> is an important factor, which<br>
can be gleaned from the activity trajectories. The calibration factor,<br>
<em>Θ</em>, is determined through model calibration; this also absorbs all<br>
units of the individual factors. All of this together predicts whether<br>
susceptible individuals become infected with SARS-CoV-2 during an<br>
interaction with an infectious person. For additional details, see<br>
(<a href="https://doi.org/10.48550/arXiv.2011.11453" target="_blank" rel="noopener noreferrer">Müller 2020</a>).</p>
<h2 id="disease-progression-model" tabindex="-1"><a class="header-anchor" href="#disease-progression-model"><span>Disease Progression Model</span></a></h2>
<p>After an agent is infected with SARS-CoV-2, the disease progression<br>
model is used to determine if COVID-19 develops and if (and when) certain<br>
disease stages occur. When the infection model reports that a<br>
<code v-pre>susceptible</code> person is infected, the agent is initially assigned the<br>
state of <code v-pre>infectedButNotContagious</code>. At the beginning of each iteration<br>
(simulated day), there will be a certain chance for the infection state<br>
of the agent to change. The worst<br>
possible progression would be as follows:<br>
<code v-pre>infectedButNotContagious</code> → <code v-pre>infectious</code><br>
→ <code v-pre>showingSymptoms</code> → <code v-pre>seriouslySick</code> → <code v-pre>critical</code> → <code v-pre>seriouslySick</code> → <code v-pre>recovered</code><sup class="footnote-ref"><a href="#footnote2">[2]</a><a class="footnote-anchor" id="footnote-ref2"></a></sup>. However, starting with the<br>
<code v-pre>infectious</code> state, there is always a chance of becoming <code v-pre>recovered</code>.</p>
<p><img src="@source/images/DiseaseProgressionModel.png" alt="Example Image"><br>
<em>Visualization of progression model. See also <a href="https://doi.org/10.48550/arXiv.2011.11453" target="_blank" rel="noopener noreferrer">Müller 2020</a></em>.</p>
<p>The progression model uses age-dependent transition probabilities to<br>
determine whether the agent moves to a more dire state or to the<br>
<code v-pre>recovered</code> state. The progression model also sets the duration of each<br>
state based on medians and standard deviations found in the literature.<br>
The agent can only infect other agents in the infectious state or within<br>
the first few days of the showing symptoms state; in later states, it is<br>
assumed that the agent is either isolating at home or in the hospital.<br>
Readers who would like more information on the sources of the transition<br>
probabilities are encouraged to read Section 2.3 of<br>
(<a href="https://doi.org/10.48550/arXiv.2011.11453" target="_blank" rel="noopener noreferrer">Müller 2020</a>).</p>
<h2 id="vaccination-model" tabindex="-1"><a class="header-anchor" href="#vaccination-model"><span>Vaccination Model</span></a></h2>
<p>Historical vaccinations, which are administered to a portion of the<br>
population at the beginning of each day, are implemented in<br>
<code v-pre>VaccinationFromData</code>. To accurately represent the vaccination quotas<br>
per age group and manufacturer shares in EpiSim, the model adheres to<br>
the official German vaccination quotas and manufacturer shares provided<br>
by <a href="https://doi.org10.5281/zenodo.12697471" target="_blank" rel="noopener noreferrer">rki</a>; thus ensuring alignment with the actual<br>
distribution within the German population. RKI provides the number of vaccinations per<br>
date for four age groups (5-11, 12-7, 18-59 and 60+ years old) on the<br>
county level and the number of vaccinations per manufacturer (i.e.<br>
Comirnaty, Spikevax, Vaxzevria) on the federal state level. In EpiSim,<br>
agents are divided into the same age groups. However, only agents who<br>
are a) <code v-pre>susceptible</code>, b) have not been vaccinated in the previous 90<br>
days, and c) have not been infected during the previous 90 days are<br>
eligible for vaccination. For the booster vaccine, agents must<br>
additionally have already been vaccinated to be considered eligible, and<br>
for the second booster, agents must have already been boostered to be<br>
considered eligible. Per age group and per manufacturer, the available<br>
doses per manufacturer are then randomly given to the eligible agents.<br>
For each agent, the latest vaccination date, the number of vaccinations<br>
as well as the vaccination type they received are saved<sup class="footnote-ref"><a href="#footnote3">[3]</a><a class="footnote-anchor" id="footnote-ref3"></a></sup>.</p>
<h2 id="antibody-model" tabindex="-1"><a class="header-anchor" href="#antibody-model"><span>Antibody Model</span></a></h2>
<p>Antibody levels of individual agents are implemented in<br>
<code v-pre>DefaultAntibodyModel</code>. After the first immunization event (either<br>
vaccination or infection), an agent's strain-specific antibody levels<br>
are set. A relative antibody level of 0 translates to no protection,<br>
while a relative antibody level of 1 translates to 50% protection<br>
against infection. However, these antibody levels are dynamic and may,<br>
due to waning, decrease over time. An additional immunization event,<br>
either via infection or via vaccination, is necessary to boost the<br>
agent's antibody levels again. For a detailed discussion of<br>
EpiSim's<br>
antibody model see <a href="http://dx.doi.org/10.1016/j.isci.2023.107554" target="_blank" rel="noopener noreferrer">Müller 2023</a>.</p>
<hr class="footnotes-sep">
<section class="footnotes">
<ol class="footnotes-list">
<li id="footnote1" class="footnote-item"><p>The equation used in [episim]{acronym-label=&quot;episim&quot;<br>
acronym-form=&quot;singular+short&quot;} to calculate the probability of<br>
infection along with a detailed explanation can be found in<br>
(<a href="https://doi.org/10.48550/arXiv.2011.11453" target="_blank" rel="noopener noreferrer">Müller 2020</a>). <a href="#footnote-ref1" class="footnote-backref">↩︎</a></p>
</li>
<li id="footnote2" class="footnote-item"><p>There is no death in Episim. <a href="#footnote-ref2" class="footnote-backref">↩︎</a></p>
</li>
<li id="footnote3" class="footnote-item"><p>If current vaccination data is unavailable or if future<br>
developers/users decide not to follow the vaccination quotas<br>
provided by RKI, alternative vaccination strategies may be<br>
implemented. <a href="#footnote-ref3" class="footnote-backref">↩︎</a></p>
</li>
</ol>
</section>
</div></template>



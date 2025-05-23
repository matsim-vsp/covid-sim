<template><div><h1 id="episim-simulation-setup" tabindex="-1"><a class="header-anchor" href="#episim-simulation-setup"><span>EpiSim - Simulation Setup</span></a></h1>
<p>At the beginning of an EpiSim simulation, various input files must be
imported and the settings must be configured. Doing this manually for
each simulation would be work-intensive and prone to human-error. Thus,
each study area has a separate class, a so-called &quot;production scenario,&quot;
which sets all the regionally applicable input files and default
configuration values. For instance, the school vacation periods are
different for Berlin and Cologne (the class
<code v-pre>SnzBerlinProductionScenario</code> is used for Berlin). The following
subsection describes the input files that the production scenario reads
before the simulation begins. Afterward, the data structure containing
the configuration options---episim-config---is introduced, followed by
the way in which activity reductions are configured.</p>
<h2 id="inputs" tabindex="-1"><a class="header-anchor" href="#inputs"><span>Inputs</span></a></h2>
<p>The essential input files for any EpiSim simulation are:</p>
<ul>
<li>
<p><strong>Population Input:</strong> EpiSim has agents that move around the study
area, and meet in facilities to complete activities (where there
exists the chance of infection). Within the production scenario, a
population file is imported that contains the demographic information
for every individual simulated in EpiSim. In the standard Cologne model, this
includes age, sex, and details of their home: longitude and latitude,
facility ID, and county. The ability to integrate this demographic
information into the simulation makes this ABM powerful; e.g., for age-prioritized
vaccine distribution strategies, the age of an individual is read from
the population file to determine eligibility.</p>
</li>
<li>
<p><strong>Facilities Input:</strong> Similarly, the facilities file enriches the
model by providing information about each activity location: the
longitude and latitude, as well as information about what activities
can occur at that location.</p>
</li>
<li>
<p><strong>Events Files:</strong> Vital to EpiSim is the mobility behavior of
individuals; this information is contained in so-called &quot;events&quot;
files. The format of the events file follows the standard set by the
MATSim output events files (see Figure 1 below for a depiction of an exemplary events file). Users can, however, create map
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
pertinent information.<br>
If the user specifies only a single events file, then it is assumed
that the agent has the exact same daily plan for every day of the
year. However, depending on the level of detail of the user's data,
multiple events files may also be included<sup class="footnote-ref"><a href="#footnote1">[1]</a><a class="footnote-anchor" id="footnote-ref1"></a></sup>.</p>
<p><img src="@source/images/traj2.png" alt="Example Image"></p>
<p><code v-pre>&lt;event time=&quot;8:00&quot; type=&quot;actend&quot; person=&quot;Lily&quot; facility=&quot;home\_lily&quot; actType=&quot;home&quot;/&gt;}</code> <br>
<code v-pre>&lt;event time=&quot;8:10&quot; type=&quot;actend&quot; person=&quot;Sam&quot; facility=&quot;home\_sam&quot; actType=&quot;home&quot;/&gt;</code> <br>
<code v-pre>&lt;event time=&quot;8:15” type=&quot;PersonEntersVehicle&quot; person=&quot;Lily&quot; vehicle=&quot;Bus245&quot;/&gt;</code> <br>
<code v-pre>&lt;event time=&quot;8:20” type=&quot;PersonEntersVehicle&quot; person=&quot;Sam&quot; vehicle=&quot;Bus245&quot;/&gt;</code> <br>
<code v-pre>&lt;event time=&quot;8:45&quot; type=&quot;actend&quot; person=&quot;Toby&quot; facility=&quot;home\_toby&quot; actType=&quot;home&quot;/&gt;</code> <br>
<code v-pre>&lt;event time=&quot;8:50” type=&quot;PersonLeavesVehicle&quot; person=&quot;Lily&quot; vehicle=&quot;Bus245&quot;/&gt;</code> <br>
<code v-pre>&lt;event time=&quot;9:00&quot; type=&quot;actstart&quot; person=&quot;Toby&quot; facility=&quot;schoolX&quot; actType=&quot;edu&quot;/&gt;</code> <br>
<code v-pre>&lt;event time=&quot;9:00&quot; type=&quot;actstart&quot; person=&quot;Lily&quot; facility=&quot;schoolX&quot; actType=&quot;edu&quot;/&gt;</code> <br>
<code v-pre>&lt;event time=&quot;9:10” type=&quot;PersonLeavesVehicle&quot; person=&quot;Sam&quot; vehicle=&quot;Bus245&quot;/&gt;</code> <br>
<code v-pre>&lt;event time=&quot;9:15&quot; type=&quot;actstart&quot; person=&quot;Sam&quot; facility=&quot;officeX&quot; actType=&quot;work&quot;/&gt;</code> <br>
<em><strong>Figure 1.</strong> Top: Example Trajectories of three agents (Toby, Lily, and Sam), in which agents spend time in the same spaces (in a bus, or in school, in this example). Bottom: Corresponding list of events required for EpiSim to determine whether agents spent time in same space.</em></p>
</li>
<li>
<p><strong>Activity Reduction:</strong> While the events files provide the typical
daily plans of agents, an activity reduction input is required to
decrease mobility during the COVID-19 pandemic (or a potential future
outbreak). This dataset specifies what percentage of activities of a
specific type take place on a given day. As will be shown in
<em>background-policy</em>, these activity reductions will be
incorporated into the <code v-pre>Restrictions</code> for certain activity types<sup class="footnote-ref"><a href="#footnote2">[2]</a><a class="footnote-anchor" id="footnote-ref2"></a></sup>.</p>
</li>
</ul>
<p>ADD FIGURE HERE</p>
<p>Optional inputs for an EpiSim simulation are:</p>
<ul>
<li>
<p><strong>Temperature.</strong> Temperature influences whether individuals
(partially) perform their activities outside. Daily temperature data
(from <a href="https://meteostat.net/en/" target="_blank" rel="noopener noreferrer">Meteostat</a>) is read in and converted to the so-called
&quot;outdoor fraction&quot; (see <a href="http://dx.doi.org/10.1371/journal.pone.0259037" target="_blank" rel="noopener noreferrer">Mueller 2021</a>, <a href="http://dx.doi.org/10.1038/s41598-024-64230-1" target="_blank" rel="noopener noreferrer">Paltra 2024</a> for details on
outdoor fraction).</p>
</li>
<li>
<p><strong>Vaccination Quotas.</strong> In Germany, the Robert Koch Insitute (RKI) reported the daily number of
COVID-19
vaccinations from December 26h, 2020 until July 9th, 2024. The number
of vaccinations per day in the model follows these official
vaccination numbers (see
<strong><RouteLink to="/docs2/episimsimulation.html##vaccination-model">Vaccination Model</RouteLink></strong>).</p>
</li>
<li>
<p><strong>Mask Usage.</strong> Mask files provide the compliance to mask mandates on
public transport. The model agents comply to these mandates at the
same rates.</p>
</li>
<li>
<p><strong>Disease Import.</strong> Disease import files include the number of
infections that are imported into the model area. As of now, disease
import is dominated by individuals returning from their travels at the
end of the school holidays. However, disease import could also include
import from alternative national geographical areas.</p>
</li>
</ul>
<h2 id="episim-configuration" tabindex="-1"><a class="header-anchor" href="#episim-configuration"><span>EpiSim Configuration</span></a></h2>
<p>EpiSim is
designed to be extensively configurable and extendable. The class
<code v-pre>EpiSimConfigGroup</code> specifies most of the aspects of
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
susceptible agent to contract the disease (<a href="https://doi.org/10.1136/jech.2003.011593" target="_blank" rel="noopener noreferrer">Barreto 2006</a>).
These parameters are configured in the episim-config container for
different age groups. The episim-config also specifies how many
individuals are infected with SARS-CoV-2 at the beginning of the
simulation.</p>
<p>Nested within the episim-config are the progression and policy configs.
The progression-config (see
<em><RouteLink to="/docs2/episimsimulation.html##disease-progression-model">Disease Progression Model</RouteLink></em>) specifies the transition probabilities
between different disease states: i.e. what percent of young adults will
become &quot;seriously sick&quot; after &quot;showing symptoms&quot; for 4 days. It also
includes the policy-config, which specifies how restrictions will be
applied to the population throughout the simulation (see <em><RouteLink to="/docs2/episimsimulation.html##disease-progression-model">Disease Progression Model</RouteLink></em>).</p>
<h2 id="policy" tabindex="-1"><a class="header-anchor" href="#policy"><span>Policy</span></a></h2>
<p>As noted above, the episim-config contains a policy-config, which
specifies how activity restrictions are applied to the population
throughout the simulation. We first describe the <em>Restriction</em>, a basic
data structure that contains activity reduction information. Thereafter,
we describe the default restriction policy: <em>FixedPolicy</em>.</p>
<p><strong>Restriction:</strong> The activity reduction information is stored in a data
structure called <code v-pre>Restriction</code>. One <code v-pre>Restriction</code> container is
applicable to one activity type<sup class="footnote-ref"><a href="#footnote3">[3]</a><a class="footnote-anchor" id="footnote-ref3"></a></sup>. Within the <code v-pre>Restriction</code>, the
<code v-pre>remainingFraction</code> field dictates what percentage of activities take
place that day. For example, on a given day, the <code v-pre>remainingFraction</code> for
work activities could be 66%, meaning that one third of work events are
skipped. The <code v-pre>Restriction</code> container also contains information on mask
usage---what percent of people wear what type of mask---maximum group
sizes, whether activities locations close early or are closed
altogether. The policy-config specifies how the <code v-pre>Restriction</code> container
is filled. The <code v-pre>remainingFraction</code>s are based on the input data (see
activity reduction, above).</p>
<hr class="footnotes-sep">
<section class="footnotes">
<ol class="footnotes-list">
<li id="footnote1" class="footnote-item"><p><strong>VSP Implementation</strong>: VSP uses three event files: a typical
weekday, a typical Saturday, and a typical Sunday. In a week, the
weekday events are replayed five times (Monday -- Friday), followed
by a single run through of the Saturday and Sunday events
respectively. <a href="#footnote-ref1" class="footnote-backref">↩︎</a></p>
</li>
<li id="footnote2" class="footnote-item"><p><strong>VSP Implementation</strong>: Every day during the
COVID-19
pandemic, VSP
was provided with mobility data from cell-phone providers. The
information includes the number and average duration of activities
(for various activity types) that residents of a given zip-code
complete on a given day. The class <code v-pre>AnalyzeSnzData</code> aggregates this
data for a given study area, and calculates the daily activity
reductions, as compared to a pre-COVID-19 baseline. <a href="#footnote-ref2" class="footnote-backref">↩︎</a></p>
</li>
<li id="footnote3" class="footnote-item"><p><strong>VSP Implementation</strong>: In our case, it was sufficient to
aggregate the mobility reductions such that the <code v-pre>Restriction</code> is
applied for one week. This time-frame could also be shortened, e.g.
to apply different reductions for holidays. <a href="#footnote-ref3" class="footnote-backref">↩︎</a></p>
</li>
</ol>
</section>
</div></template>



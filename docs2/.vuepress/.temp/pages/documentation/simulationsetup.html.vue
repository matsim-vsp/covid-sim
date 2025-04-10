<template><div><h1 id="episim-simulation-setup" tabindex="-1"><a class="header-anchor" href="#episim-simulation-setup"><span>EpiSim - Simulation Setup</span></a></h1>
<p>At the beginning of an EpiSim simulation, various input files must be<br>
imported and the settings must be configured. Doing this manually for<br>
each simulation would be work-intensive and prone to human-error. Thus,<br>
each study area has a separate class, a so-called &quot;production scenario,&quot;<br>
which sets all the regionally applicable input files and default<br>
configuration values. For instance, the school vacation periods are<br>
different for Berlin and Cologne (the class<br>
<code v-pre>SnzBerlinProductionScenario</code> is used for Berlin). The following<br>
subsection describes the input files that the production scenario reads<br>
before the simulation begins. Afterward, the data structure containing<br>
the configuration options---episim-config---is introduced, followed by<br>
the way in which activity reductions are configured.</p>
<h2 id="inputs" tabindex="-1"><a class="header-anchor" href="#inputs"><span>Inputs</span></a></h2>
<p>The essential input files for any EpiSim simulation are:</p>
<ul>
<li>
<p><strong>Population Input:</strong> EpiSim has agents that move around the study<br>
area, and meet in facilities to complete activities (where there<br>
exists the chance of infection). Within the production scenario, a<br>
population file is imported that contains the demographic information<br>
for every individual simulated in EpiSim. In the standard Cologne model, this<br>
includes age, sex, and details of their home: longitude and latitude,<br>
facility ID, and county. The ability to integrate this demographic<br>
information into the simulation makes this ABM powerful; e.g., for age-prioritized<br>
vaccine distribution strategies, the age of an individual is read from<br>
the population file to determine eligibility.</p>
</li>
<li>
<p><strong>Facilities Input:</strong> Similarly, the facilities file enriches the<br>
model by providing information about each activity location: the<br>
longitude and latitude, as well as information about what activities<br>
can occur at that location.</p>
</li>
<li>
<p><strong>Events Files:</strong> Vital to EpiSim is the mobility behavior of<br>
individuals; this information is contained in so-called &quot;events&quot;<br>
files. The format of the events file follows the standard set by the<br>
MATSim output events files (see Figure 1 below for a depiction of an exemplary events file). Users can, however, create map<br>
mobility data from other sources (i.e. travel diaries). If an agent<br>
travels per public transit, the model knows when they got on and off<br>
the vehicle and the ID of that vehicle. When the agent conducts an<br>
activity, the activity type (e.g. home, leisure, work), the activity<br>
location, and the timeframe are accessible to the model. During the<br>
simulation, the contact model may use this information to detail all<br>
contacts between individuals, whether in a bus or in a university<br>
class. Within the events files, IDs of the corresponding agent,<br>
activity facility, or public transit vehicle are specified. These IDs<br>
can be matched to the population and facilities files, to extract<br>
pertinent information.<br>
If the user specifies only a single events file, then it is assumed<br>
that the agent has the exact same daily plan for every day of the<br>
year. However, depending on the level of detail of the user's data,<br>
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
<p><strong>Activity Reduction:</strong> While the events files provide the typical<br>
daily plans of agents, an activity reduction input is required to<br>
decrease mobility during the COVID-19 pandemic (or a potential future<br>
outbreak). This dataset specifies what percentage of activities of a<br>
specific type take place on a given day. As will be shown in<br>
<em>background-policy</em>, these activity reductions will be<br>
incorporated into the <code v-pre>Restrictions</code> for certain activity types<sup class="footnote-ref"><a href="#footnote2">[2]</a><a class="footnote-anchor" id="footnote-ref2"></a></sup>.</p>
</li>
</ul>
<p>ADD FIGURE HERE</p>
<p>Optional inputs for an EpiSim simulation are:</p>
<ul>
<li>
<p><strong>Temperature.</strong> Temperature influences whether individuals<br>
(partially) perform their activities outside. Daily temperature data<br>
(from <a href="https://meteostat.net/en/" target="_blank" rel="noopener noreferrer">Meteostat</a>) is read in and converted to the so-called<br>
&quot;outdoor fraction&quot; (see <a href="http://dx.doi.org/10.1371/journal.pone.0259037" target="_blank" rel="noopener noreferrer">Mueller 2021</a>, <a href="http://dx.doi.org/10.1038/s41598-024-64230-1" target="_blank" rel="noopener noreferrer">Paltra 2024</a> for details on<br>
outdoor fraction).</p>
</li>
<li>
<p><strong>Vaccination Quotas.</strong> In Germany, the Robert Koch Insitute (RKI) reported the daily number of<br>
COVID-19<br>
vaccinations from December 26h, 2020 until July 9th, 2024. The number<br>
of vaccinations per day in the model follows these official<br>
vaccination numbers (see<br>
<strong><RouteLink to="/documentation/episimsimulation.html##vaccination-model">Vaccination Model</RouteLink></strong>).</p>
</li>
<li>
<p><strong>Mask Usage.</strong> Mask files provide the compliance to mask mandates on<br>
public transport. The model agents comply to these mandates at the<br>
same rates.</p>
</li>
<li>
<p><strong>Disease Import.</strong> Disease import files include the number of<br>
infections that are imported into the model area. As of now, disease<br>
import is dominated by individuals returning from their travels at the<br>
end of the school holidays. However, disease import could also include<br>
import from alternative national geographical areas.</p>
</li>
</ul>
<h2 id="episim-configuration" tabindex="-1"><a class="header-anchor" href="#episim-configuration"><span>EpiSim Configuration</span></a></h2>
<p>EpiSim is<br>
designed to be extensively configurable and extendable. The class<br>
<code v-pre>EpiSimConfigGroup</code> specifies most of the aspects of<br>
EpiSim that can<br>
be configured by the user. Based on this class, a container called the<br>
episim-config is created, which holds the parameters and options<br>
selected for a given run. It includes parameters relevant to simulation<br>
mechanics, such as the simulation start-date and what outputs should be<br>
produced. It also includes parameters relevant to infection dynamics,<br>
including susceptibility and<br>
infectivity.<br>
Infectivity<br>
describes the degree to which the infectious host can transmit the<br>
disease while susceptibility describes the likelihood for the<br>
susceptible agent to contract the disease (<a href="https://doi.org/10.1136/jech.2003.011593" target="_blank" rel="noopener noreferrer">Barreto 2006</a>).<br>
These parameters are configured in the episim-config container for<br>
different age groups. The episim-config also specifies how many<br>
individuals are infected with SARS-CoV-2 at the beginning of the<br>
simulation.</p>
<p>Nested within the episim-config are the progression and policy configs.<br>
The progression-config (see<br>
<em><RouteLink to="/documentation/episimsimulation.html##disease-progression-model">Disease Progression Model</RouteLink></em>) specifies the transition probabilities<br>
between different disease states: i.e. what percent of young adults will<br>
become &quot;seriously sick&quot; after &quot;showing symptoms&quot; for 4 days. It also<br>
includes the policy-config, which specifies how restrictions will be<br>
applied to the population throughout the simulation (see <em><RouteLink to="/documentation/episimsimulation.html##disease-progression-model">Disease Progression Model</RouteLink></em>).</p>
<h2 id="policy" tabindex="-1"><a class="header-anchor" href="#policy"><span>Policy</span></a></h2>
<p>As noted above, the episim-config contains a policy-config, which<br>
specifies how activity restrictions are applied to the population<br>
throughout the simulation. We first describe the <em>Restriction</em>, a basic<br>
data structure that contains activity reduction information. Thereafter,<br>
we describe the default restriction policy: <em>FixedPolicy</em>.</p>
<p><strong>Restriction:</strong> The activity reduction information is stored in a data<br>
structure called <code v-pre>Restriction</code>. One <code v-pre>Restriction</code> container is<br>
applicable to one activity type<sup class="footnote-ref"><a href="#footnote3">[3]</a><a class="footnote-anchor" id="footnote-ref3"></a></sup>. Within the <code v-pre>Restriction</code>, the<br>
<code v-pre>remainingFraction</code> field dictates what percentage of activities take<br>
place that day. For example, on a given day, the <code v-pre>remainingFraction</code> for<br>
work activities could be 66%, meaning that one third of work events are<br>
skipped. The <code v-pre>Restriction</code> container also contains information on mask<br>
usage---what percent of people wear what type of mask---maximum group<br>
sizes, whether activities locations close early or are closed<br>
altogether. The policy-config specifies how the <code v-pre>Restriction</code> container<br>
is filled. The <code v-pre>remainingFraction</code>s are based on the input data (see<br>
activity reduction, above).</p>
<hr class="footnotes-sep">
<section class="footnotes">
<ol class="footnotes-list">
<li id="footnote1" class="footnote-item"><p><strong>VSP Implementation</strong>: VSP uses three event files: a typical<br>
weekday, a typical Saturday, and a typical Sunday. In a week, the<br>
weekday events are replayed five times (Monday -- Friday), followed<br>
by a single run through of the Saturday and Sunday events<br>
respectively. <a href="#footnote-ref1" class="footnote-backref">↩︎</a></p>
</li>
<li id="footnote2" class="footnote-item"><p><strong>VSP Implementation</strong>: Every day during the<br>
COVID-19<br>
pandemic, VSP<br>
was provided with mobility data from cell-phone providers. The<br>
information includes the number and average duration of activities<br>
(for various activity types) that residents of a given zip-code<br>
complete on a given day. The class <code v-pre>AnalyzeSnzData</code> aggregates this<br>
data for a given study area, and calculates the daily activity<br>
reductions, as compared to a pre-COVID-19 baseline. <a href="#footnote-ref2" class="footnote-backref">↩︎</a></p>
</li>
<li id="footnote3" class="footnote-item"><p><strong>VSP Implementation</strong>: In our case, it was sufficient to<br>
aggregate the mobility reductions such that the <code v-pre>Restriction</code> is<br>
applied for one week. This time-frame could also be shortened, e.g.<br>
to apply different reductions for holidays. <a href="#footnote-ref3" class="footnote-backref">↩︎</a></p>
</li>
</ol>
</section>
</div></template>



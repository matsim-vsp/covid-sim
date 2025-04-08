# EpiSim - Outputs and Analysis
All infections and disease state changes are documented by
`EpisimReporting`. This class is used to produce the output files useful
for analysis. One of the most important outputs created is
*infections.txt*, which documents the infection state counts for each
date and each county: e.g. number of individuals who are susceptible,
infected but not contagious, contagious, seriously sick, recovered,
quarantined, tested, vaccinated, etc. You may found a short description of the remaining standard outputs here:


| **File name** | **File content** |
| ------------- | ---------------- |
| \*.config.xml | The configuration options used to run the model |
| \*.vaccinations.tsv | Number of vaccinations per vaccination supplier per day. |
| \*.vaccinationsDetailed.tsv | Number of 1st/2nd/xth dosis per vaccination type (mRNA, vector, xbbupdate) per day.[^1] |
| \*.diseaseImport.tsv | Number of infections per strain being imported into the model area on each day. |
|  \*.strains.tsv | Number of new infections per strain per day. |
|  \*.infections.txt.csv | Number of agents (differentiated by vaccination status) per disease state per day; cumulative numbers are also given. Also gives information on number of tested, quarantined and vaccinated individuals per day. |
|  \*.restrictions.txt.csv | Shows the remaining fraction, contact intensity correction[^2] , and mask usage per activity type per day. Mask usage describes the cutoff points for different types of masks. E.g. *{NONE=0.1, CLOTH=0.55, SURGICAL=1.0}* indicates do not wear a mask, 45% wear a cloth mask, and 45% wear a surgical mask. |
|  \*.outdoorFraction.tsv | Share of user-configured activity types that are performed outside per day. This depends on the daily temperature. |

## Visualization

Both infection dynamics and political discourse are in constant flux;
for EpiSim to
make an impact on decision-makers, the turnover must be rapid. Covid-Sim
is a visualization tool that was developed to synthesize and plot the
outputs of hundreds or thousands of simulations. The user simply uploads
the output files to a server, and then can immediately visit a custom
URL to see their results. The website is populated with an array of
plots that show, e.g., incidence, hospitalizations, virus strains, and
testing rates for a given scenario. Readers are encouraged to visit
<https://covid-sim.info> to view recent simulation results and read the
corresponding reports. The code for covid-sim is open-source, allowing
future users to recreate the system:
<https://github.com/matsim-vsp/covid-sim>. Documentation can be found
here: <https://covid-sim.info/docs/>.

[^1]: This is the only output file that is not scaled to 100%. For a 25%
    scenario, this values need to be multiplied by four.

[^2]: For every activity type, there exists a baseline contact
    intensity. If activities are, for example, moved outside during the
    summer, then the contact intensity may manually be decreased.
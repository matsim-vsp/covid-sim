# ALL DAYS infection trip parser
#
# Parse the event file containing activity start/end times and infection events.
# - Link events are not needed -- people float between activities.
# - Time between actend and actstart is travel time for the trip
# - Save infection moments separately
#
# Produces 00x-infections.json, in NDJSON format
import matsim
import ndjson
import xopen
import xml.etree.ElementTree as ET
import sys
import random

from pyproj import Transformer

if len(sys.argv) != 2:
    print(
        "USAGE:  python generate-paths-from-events-and-facilities.py  [coord-system]"
    )
    sys.exit(1)

p_coords = sys.argv[1]

coord_transformer = Transformer.from_crs(p_coords, "EPSG:4326")

# persistent memory of agent health status
persistent = {}

# disease status numeric codes
disease_code = {
    "susceptible": 0,
    "infectedButNotContagious": 1,
    "contagious": 2,
    "showingSymptoms": 3,
    "seriouslySick": 4,
    "critical": 5,
    "recovered": 6,
}

# and the other way
code_disease = [
    "susceptible",
    "infectedButNotContagious",
    "contagious",
    "showingSymptoms",
    "seriouslySick",
    "critical",
    "recovered",
]

def facility_reader(filename):

    facility = None
    tree = ET.iterparse(xopen.xopen(filename), events=['start','end'])

    for xml_event, elem in tree:

        if elem.tag == 'facility' and xml_event == 'start':

            if facility: facility.clear() # clear memory
            facility = elem
            yield (facility.attrib)

            # free memory. Otherwise the data is kept in memory
            elem.clear()

# Each person can have up to three disease events per day.
# - If person has no disease codes, 0.0 means use yesterday's status
# - -1.0 signifies no further disease events for this day.
def build_disease_codes(diseaseList):
    if len(diseaseList) == 0:
        return [0.0, -1.0, -1.0]

    if len(diseaseList) == 1:
        return [diseaseList[0], -1.0, -1.0]

    if len(diseaseList) == 2:
        return [diseaseList[0], diseaseList[1], -1.0]

    return [diseaseList[0], diseaseList[1], diseaseList[2]]

random.seed(1234)

## ------------START DOING STUFF

# Read in facilities and create id: [x,y] lookup

print('Reading facilities')
facilities = {}
for facility in facility_reader('be_2020-facilities_assigned_simplified_grid.xml.gz'):
    # add random noise to x/y since they are in blocks
    x = float(facility['x']) + 500 * random.random() - 250.0
    y = float(facility['y']) + 500 * random.random() - 250.0
    facilities[facility['id']] = [x,y]

print(len(facilities), "facilities found")


for day in [9]: # range(1, 2):
    print(f"Processing day {day}")

    # outfile hard-coded for now
    fTrips = "trips.json"
    fInfections = f"{day:03d}-infections.json"

    magic_seconds = (day) * 86400

    # trips are identical across all days; so only read them once.
    whichEvents = "episimPersonStatus,actstart,actend"

    events = matsim.event_reader(f"day_{day:03d}.xml.gz", types=whichEvents)

    # lookups by person's health status, coords, and timepoints
    agents = {}
    infected_people = set()

    act_ends = {}
    cur_location = {}

    facility_missing = 0
    facility_found = 0

    for event in events:
        person_id = event["person"]
        if person_id.startswith("freight"):
            continue

        time = int(event["time"]) - magic_seconds
        if time < 0:
            time = 0

        # create a hollow person
        if person_id not in agents:
            agents[person_id] = {"id": person_id, "trips": [], "health": []}

        person = agents[person_id]

        # inject previous day's health at time 0, if we have it
        if person_id in persistent and len(person["health"]) == 0:
            person["health"].append((0, persistent[person_id]))

        # deal with this event:

        if event["type"] == "episimPersonStatus":
            # keep track of all infected people
            infected_people.add(person_id)
            disease = event["diseaseStatus"]
            code = disease_code[disease]

            # save infection event - overwrite previous day
            # if we're starting w a new status
            if time == 0:
                person["health"] = [(time, code)]
            else:
                person["health"].append((time, code))

            persistent[person_id] = code

        if event["type"] == "actend":
            # activity end means trip begins
            act_ends[person_id] = time

        if event["type"] == "actstart":
            # activity start means trips ends
            # No coordinates on events! Need to look up x/y from the facility
            facility = event['facility']
            # Sebastian added some flair to the facility id's that aren't in the facility file
            facility = facility.replace('home_', '')
            suffix = facility.find('_split')
            if suffix > -1: facility = facility[:suffix]

            try:
                x = round(float(facilities[facility][0]))
                y = round(float(facilities[facility][1]))
            except:
                facility_missing += 1
                continue

            facility_found += 1

            fromY, fromX = coord_transformer.transform(x,y)
            end_loc = ([round(fromX, 5), round(fromY, 5)])

            if person_id in cur_location:
                # we have a location/time, create a trip
                start_loc = cur_location[person_id]
            else:
                start_loc = (-1, -1)  # placeholder until the day ends

            coords = [start_loc, end_loc]

            # don't save stupid trips
            if time != act_ends[person_id]:
                person["trips"].extend(
                    [(act_ends[person_id], coords[0]), (time, coords[1])]
                )

            # we're at an activity, so park at this location until the next trip
            cur_location[person_id] = end_loc

    print(facility_missing, "events with missing facilities")
    print(facility_found, "events with OK facilities")

    # can't filter people
    agents = agents.values()

    # get everything sorted
    for person in agents:
        # sort the health(time,code) array
        person["dtime"] = []
        person["d"] = []

        if len(person["health"]) > 0:
            person["health"] = sorted(person["health"], key=lambda k: k[0])
            # and break it out into two separate arrays for time and health-code
            person["dtime"] = [t[0] for t in person["health"]]
            person["d"] = [t[1] for t in person["health"]]

        # convert to three-element array for each agent
        person["dtime_array"] = build_disease_codes(person["dtime"])
        person["d_array"] = build_disease_codes(person["d"])

        del person["health"]

        person["time"] = []
        person["path"] = []

        if len(person["trips"]) > 0:
            person["trips"] = sorted(person["trips"], key=lambda k: k[0])
            person["time"] = [t[0] for t in person["trips"]]
            person["path"] = [t[1] for t in person["trips"]]

            # loop last position into spot 0
            person["path"][0] = person["path"][len(person["path"]) - 1]

        del person["trips"]

    print(f"--{len(persistent.keys())} total infected")

    # write out the trips
    # includes everything, so ui can start up with alles
    with open(fTrips, "w") as f:
        f.write('id,timeStart,timeEnd,locStartX,locStartY,locEndX,locEndY\n')
        for agent in agents:
            for i in range(len(agent['time'])-1):
                f.write(
                    f"{agent['id']},{agent['time'][i]},{agent['time'][i+1]},"
                    f"{agent['path'][i][0]},{agent['path'][i][1]},"
                    f"{agent['path'][i+1][0]},{agent['path'][i+1][1]}"
                    f"\n"
                )

        # writer = ndjson.writer(f, separators=(",", ":"))  # nospace
        # for agent in agents:
        #     row = {
        #         "id": agent["id"],
        #         "trips": agent["time"],
        #         "time": agent["time"],
        #         "path": agent["path"],
        #         "dtime": agent["dtime"],
        #         "d": agent["d"],
        #     }
        #     writer.writerow(row)

    # write out the infections - every day
    with open(fInfections, "w") as f:
        writer = ndjson.writer(f, separators=(",", ":"))  # nospace
        for agent in agents:
            row = {
                "id": agent["id"],
                "dtime": agent["dtime_array"],
                "d": agent["d_array"],
            }
            writer.writerow(row)

print(f"DONE!")

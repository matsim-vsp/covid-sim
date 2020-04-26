# ALL DAYS infection trip parser
#
# Parse the event file containing activity start/end times and infection events.
# - Link events are not needed -- people float between activities.
# - Time between actend and actstart is travel time for the trip
# - Save infection moments separately
#
# Produces 00x-infections.json, in NDJSON format:
# [
#    { id: string,                   # person_id
#      time: [number...],            # array of trip time points, in seconds
#      points: [ (x,y)...],          # array of (x,y) coordinates for time points
#      disease_time: [number...],    # array of disease event time points
#      disease: [code...]            # array of disease status codes, see below
#    }
# ]
#
import matsim
import ndjson

sample_rate = 1

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

code_disease = [
    "susceptible",
    "infectedButNotContagious",
    "contagious",
    "showingSymptoms",
    "seriouslySick",
    "critical",
    "recovered",
]


def build_disease_codes(diseaseList):
    if len(diseaseList) == 0:
        return [0.0, -1.0, -1.0]

    if len(diseaseList) == 1:
        return [diseaseList[0], -1.0, -1.0]

    if len(diseaseList) == 2:
        return [diseaseList[0], agent.dtime[1], -1.0]

    return [diseaseList[0], diseaseList[1], diseaseList[2]]


for day in range(0, 92):
    print(f"Processing day {day}")

    # outfile hard-coded for now
    fTrips = "trips.json"
    fInfections = f"{day:03d}-infections.json"

    # magic_seconds = 691100 # day 8
    magic_seconds = (day) * 86400  # 345600 # 691200 # 345600

    # trips are identical across all days; so only read them once.
    whichEvents = "episimPersonStatus,actstart,actend"
    # if day == 0:
    #     whichEvents = whichEvents + ",actstart,actend"

    events = matsim.event_reader(f"day_{day:03d}.xml.gz", types=whichEvents)

    # lookups by person's health status, coords, and timepoints
    agents = {}
    infected_people = set()

    act_ends = {}
    cur_location = {}

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
            # print('person',person_id,'is already',code_disease[persistent[person_id]])
            person["health"].append((0, persistent[person_id]))

        # deal with this event

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

            # if person_id not in persistent:
            #    print (person_id, 'is newly', code_disease[code])
            persistent[person_id] = code

        if event["type"] == "actend":
            # activity end means trip begins
            act_ends[person_id] = time

        if event["type"] == "actstart":
            # activity start means trips ends
            x = round(float(event["x"]))
            y = round(float(event["y"]))
            end_loc = (x, y)

            if person_id in cur_location:
                # we have a location/time, create a trip
                start_loc = cur_location[person_id]

                coords = [start_loc, end_loc]

                # don't save stupid trips
                saveTrip = True
                if start_loc[0] == end_loc[0] and start_loc[1] == end_loc[1]:
                    saveTrip = False
                if time == act_ends[person_id]:
                    saveTrip = False

                # save it
                if saveTrip:
                    person["trips"].extend(
                        [(act_ends[person_id], coords[0]), (time, coords[1])]
                    )

            # we're at an activity, so park at this location until the next trip
            cur_location[person_id] = end_loc

    # filter out lots of people so it fits in our cute viz
    agents = [
        p
        for p in agents.values()
        if (
            len(p["trips"]) > 0
            and (p["id"] in persistent)
            or (int(p["id"][:-2]) % sample_rate == 0)
        )
        # if (len(p['trips']) > 0 and (p["id"] in persistent) or (int(p["id"][:-2]) % sample_rate == 0))
    ]

    # get everything sorted
    for person in agents:
        # sort the health(time,code) array
        person["health"] = sorted(person["health"], key=lambda k: k[0])
        # and break it out into two separate arrays for time and health-code
        person["dtime"] = [t[0] for t in person["health"]]
        person["d"] = [t[1] for t in person["health"]]
        # convert to three-element array for each agent
        person["dtime_array"] = build_disease_codes(person["dtime"])
        person["d_array"] = build_disease_codes(person["d"])

        del person["health"]

        person["trips"] = sorted(person["trips"], key=lambda k: k[0])
        person["time"] = [t[0] for t in person["trips"]]
        person["path"] = [t[1] for t in person["trips"]]
        del person["trips"]

    print(f"--{len(persistent.keys())} total infected")

    # write out the trips - just once
    # includes everything, so ui can start up with alles
    if day == 0:
        with open(fTrips, "w") as f:
            writer = ndjson.writer(f, separators=(",", ":"))  # nospace
            for agent in agents:
                row = {
                    "id": agent["id"],
                    "trips": agent["time"],
                    "time": agent["time"],
                    "path": agent["path"],
                    "dtime": agent["dtime"],
                    "d": agent["d"],
                }
                writer.writerow(row)

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

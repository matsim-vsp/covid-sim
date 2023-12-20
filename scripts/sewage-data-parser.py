import urllib.request
import html_to_json
import json
import csv

# download and parse the Abwassersurveillance from the rki
opener = urllib.request.FancyURLopener({})
url = "https://www.rki.de/DE/Content/Institut/OrgEinheiten/Abt3/FG32/Abwassersurveillance/Bericht_Abwassersurveillance.html?__blob=publicationFile"
f = opener.open(url)
content = f.read()

# convert the html-string to json, get the data, convert the data to json and get the x- and y-data
output_json = html_to_json.convert(content)
current = output_json["html"][0]["body"][0]["div"][0]["script"][1]["_value"]
current = json.loads(current)["x"]["data"]
dates = current[3]["x"]
viruslast = current[3]["y"]

# write the data to a .csv file
with open('abwassersurveillance.csv', 'w', newline='') as file:
    writer = csv.writer(file)
    field = ["date", "viruslast"]

    writer.writerow(field)

    for i in range(len(dates)):
        writer.writerow([dates[i], viruslast[i]])
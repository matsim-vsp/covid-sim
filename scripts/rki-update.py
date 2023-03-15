# -*- coding: utf-8 -*-
#
# RKI Data Parser
#
# Requires Python 3.7+, pandas and dfply
# You can install pandas and dfply with one command:
#   pip install pandas dfply
#
# Usage:  python3 rki-update.py [RKI-filename.csv]

print("RKI Updater script")

try:
    import sys
    import pandas as pd
    from dfply import *
except:
    print("Requires pandas and dfply modules.")
    print("You can install them with:  pip install pandas dfply")
    sys.exit(1)

# if len(sys.argv) != 2:
#     print("Usage:  python rki-update.py [RKI-filename.csv]")
#     sys.exit(1)

# print("Reading csv:", sys.argv[1])

csv = pd.read_csv('https://media.githubusercontent.com/media/robert-koch-institut/SARS-CoV-2-Infektionen_in_Deutschland/main/Aktuell_Deutschland_SarsCov2_Infektionen.csv', parse_dates=True)

# split out dates
csv >>= separate(
    X.Refdatum,  # This is actually the X.Refdatum but unix "cut" command is off-by-one
    ["year", "dash1", "month", "dash2", "day"],
    sep=[4, 5, 7, 8, 10],
    convert=True,
    remove=False,
) >> separate(
    X.Meldedatum,
    ["myear", "dash1", "mmonth", "dash2", "mday"],
    sep=[4, 5, 7, 8, 10],
    convert=True,
    remove=False,
) >> select(X.IdLandkreis, X.AnzahlFall, X.year, X.month, X.day, X.myear, X.mmonth, X.mday)

print(csv)

# Berlin
fname = "berlin-cases.csv"
print(fname)
berlin = (
    csv
    >> filter_by(X.IdLandkreis >=  11001, X.IdLandkreis <=  11012)
    >> group_by(X.IdLandkreis, X.year, X.month, X.day)
    >> summarize(cases=X.AnzahlFall.sum())
    >> arrange(X.year, X.month, X.day)
)

berlin.to_csv(fname, index=False, columns=["year", "month", "day", "cases"])

# Berlin - Meldedatum
fname = "berlin-cases-meldedatum.csv"
print(fname)
mberlin = (
    csv
    >> filter_by(X.IdLandkreis == 11001)
    >> group_by(X.IdLandkreis, X.myear, X.mmonth, X.mday)
    >> summarize(cases=X.AnzahlFall.sum())
    >> arrange(X.myear, X.mmonth, X.mday)
    >> rename(year=X.myear, month=X.mmonth, day=X.mday)
)

mberlin.to_csv(fname, index=False, columns=["year", "month", "day", "cases"])

# Koeln
fname = "cologne-cases.csv"
print(fname)
berlin = (
    csv
    >> filter_by(X.IdLandkreis == 5315)
    >> group_by(X.IdLandkreis, X.year, X.month, X.day)
    >> summarize(cases=X.AnzahlFall.sum())
    >> arrange(X.year, X.month, X.day)
)

berlin.to_csv(fname, index=False, columns=["year", "month", "day", "cases"])

# Koeln - Meldedatum
fname = "cologne-cases-meldedatum.csv"
print(fname)
mberlin = (
    csv
    >> filter_by(X.IdLandkreis == 5315)
    >> group_by(X.IdLandkreis, X.myear, X.mmonth, X.mday)
    >> summarize(cases=X.AnzahlFall.sum())
    >> arrange(X.myear, X.mmonth, X.mday)
    >> rename(year=X.myear, month=X.mmonth, day=X.mday)
)

mberlin.to_csv(fname, index=False, columns=["year", "month", "day", "cases"])


# München
fname = "munich-cases.csv"
print(fname)
munich = (
    csv
    >> filter_by(X.IdLandkreis == 9162)
    >> group_by(X.IdLandkreis, X.year, X.month, X.day)
    >> summarize(cases=X.AnzahlFall.sum())
    >> arrange(X.year, X.month, X.day)
)

munich.to_csv(fname, index=False, columns=["year", "month", "day", "cases"])

# Köln
fname = "cologne-cases.csv"
print(fname)
cologne = (
    csv
    >> filter_by(X.IdLandkreis == 5315)
    >> group_by(X.IdLandkreis, X.year, X.month, X.day)
    >> summarize(cases=X.AnzahlFall.sum())
    >> arrange(X.year, X.month, X.day)
)

cologne.to_csv(fname, index=False, columns=["year", "month", "day", "cases"])


# Heinsberg
# fname = "heinsberg-cases.csv"
# print(fname)
# heinsberg = (
#     csv
#     >> filter_by(X.IdLandkreis == 5370016)
#     >> group_by(X.IdLandkreis, X.year, X.month, X.day)
#     >> summarize(cases=X.AnzahlFall.sum())
#     >> arrange(X.year, X.month, X.day)
# )

# heinsberg.to_csv(fname, index=False, columns=["year", "month", "day", "cases"])

### same by reporting date (Meldedatum):

# needs to be re-read because the original file is garbled (could be fixed)
csv = pd.read_csv('https://media.githubusercontent.com/media/robert-koch-institut/SARS-CoV-2-Infektionen_in_Deutschland/main/Aktuell_Deutschland_SarsCov2_Infektionen.csv', parse_dates=True)

# sys.argv[1]

# split out dates
csv >>= separate(
    X.Meldedatum,
    ["year", "dash1", "month", "dash2", "day"],
    sep=[4, 5, 7, 8, 10],
    convert=True,
    remove=False,
) >> select(X.IdLandkreis, X.AnzahlFall, X.year, X.month, X.day)

# Berlin
fname = "berlin-cases-by-reporting-date.csv"
print(fname)
berlin = (
        csv
        >> filter_by(X.IdLandkreis >=  11001, X.IdLandkreis <=  11012)
        >> group_by(X.IdLandkreis, X.year, X.month, X.day)
        >> summarize(cases=X.AnzahlFall.sum())
        >> arrange(X.year, X.month, X.day)
)

berlin.to_csv(fname, index=False, columns=["year", "month", "day", "cases"])



print("--Done!")

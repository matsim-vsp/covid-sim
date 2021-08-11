#!/usr/bin/env python3.7
# -*- coding: utf-8 -*-
#
# RKI Data Parser
#
# Requires Python 3.7, pandas and dfply
# You can install pandas and dfply with one command:
#   pip install pandas dfply
#
# Usage:  python rki-update.py [RKI-filename.csv]

print("RKI Updater script")

try:
    import sys
    import pandas as pd
    from dfply import *
except:
    print("Requires pandas and dfply modules.")
    print("You can install them with:  pip install pandas dfply")
    sys.exit(1)

if len(sys.argv) != 2:
    print("Usage:  python rki-update.py [RKI-filename.csv]")
    sys.exit(1)

print("Reading csv:", sys.argv[1])

csv = pd.read_csv(sys.argv[1], parse_dates=True)

# split out dates
csv >>= separate(
    X.Refdatum,
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
) >> select(X.Bundesland, X.Landkreis, X.AnzahlFall, X.year, X.month, X.day, X.myear, X.mmonth, X.mday)

# Berlin
fname = "berlin-cases.csv"
print(fname)
berlin = (
    csv
    >> filter_by(X.Bundesland == "Berlin")
    >> group_by(X.Bundesland, X.year, X.month, X.day)
    >> summarize(cases=X.AnzahlFall.sum())
    >> arrange(X.year, X.month, X.day)
)

berlin.to_csv(fname, index=False, columns=["year", "month", "day", "cases"])

# Berlin - Meldedatum
fname = "berlin-cases-meldedatum.csv"
print(fname)
mberlin = (
    csv
    >> filter_by(X.Bundesland == "Berlin")
    >> group_by(X.Bundesland, X.myear, X.mmonth, X.mday)
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
    >> filter_by(X.Bundesland == "Berlin")
    >> group_by(X.Bundesland, X.year, X.month, X.day)
    >> summarize(cases=X.AnzahlFall.sum())
    >> arrange(X.year, X.month, X.day)
)

berlin.to_csv(fname, index=False, columns=["year", "month", "day", "cases"])

# Koeln - Meldedatum
fname = "cologne-cases-meldedatum.csv"
print(fname)
mberlin = (
    csv
    >> filter_by(X.Bundesland == "Berlin")
    >> group_by(X.Bundesland, X.myear, X.mmonth, X.mday)
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
    >> filter_by(X.Landkreis == "SK München")
    >> group_by(X.Landkreis, X.year, X.month, X.day)
    >> summarize(cases=X.AnzahlFall.sum())
    >> arrange(X.year, X.month, X.day)
)

munich.to_csv(fname, index=False, columns=["year", "month", "day", "cases"])

# Köln
fname = "cologne-cases.csv"
print(fname)
cologne = (
    csv
    >> filter_by(X.Landkreis == "SK Köln")
    >> group_by(X.Landkreis, X.year, X.month, X.day)
    >> summarize(cases=X.AnzahlFall.sum())
    >> arrange(X.year, X.month, X.day)
)

cologne.to_csv(fname, index=False, columns=["year", "month", "day", "cases"])


# Heinsberg
fname = "heinsberg-cases.csv"
print(fname)
heinsberg = (
    csv
    >> filter_by(X.Landkreis == "LK Heinsberg")
    >> group_by(X.Landkreis, X.year, X.month, X.day)
    >> summarize(cases=X.AnzahlFall.sum())
    >> arrange(X.year, X.month, X.day)
)

heinsberg.to_csv(fname, index=False, columns=["year", "month", "day", "cases"])

### same by reporting date (Meldedatum):

# needs to be re-read because the original file is garbled (could be fixed)
csv = pd.read_csv(sys.argv[1], parse_dates=True)

# split out dates
csv >>= separate(
    X.Meldedatum,
    ["year", "dash1", "month", "dash2", "day"],
    sep=[4, 5, 7, 8, 10],
    convert=True,
    remove=False,
) >> select(X.Bundesland, X.Landkreis, X.AnzahlFall, X.year, X.month, X.day)

# Berlin
fname = "berlin-cases-by-reporting-date.csv"
print(fname)
berlin = (
        csv
        >> filter_by(X.Bundesland == "Berlin")
        >> group_by(X.Bundesland, X.year, X.month, X.day)
        >> summarize(cases=X.AnzahlFall.sum())
        >> arrange(X.year, X.month, X.day)
)

berlin.to_csv(fname, index=False, columns=["year", "month", "day", "cases"])



print("--Done!")

#!/usr/bin/env bash
# -----------------------------------------------------
# build-travis.sh:
# copy files to the right places and then use yarn to build the site
# Requires $SVN_USER and $SVN_PASSWORD env variables to be set
# -----------------------------------------------------
# set strict mode: fail smart, don't hide pipe errors
set -xeuo pipefail
IFS=$'\n\t'
# -----------------------------------------------------

echo BUILD: Getting RKI_FILE

RKI_FILE=https://www.arcgis.com/sharing/rest/content/items/f10774f1c63e40168479a1feb6c7ca74/data

wget -nv -O rki.csv $RKI_FILE

echo BUILD: Create [city]-cases.csv files
# create the [city]-cases.csv files
python3 scripts/rki-update.py rki.csv

echo BUILD: Check out SVN and move *.csv files
# put them in the right places
svn checkout --username $SVN_USER --password $SVN_PASSWORD --no-auth-cache --depth infinity \
    https://svn.vsp.tu-berlin.de/repos/public-svn/matsim/scenarios/countries/de/episim/original-data/Fallzahlen/

cp *cases* src/assets
cp *cases* Fallzahlen/RKI

echo BUILD: Commit cases to SVN

TIMESTAMP=`date`
svn commit --username $SVN_USER --password $SVN_PASSWORD  --no-auth-cache -m "autobuild: $TIMESTAMP" Fallzahlen

# Get Berlin hospital data too
cp Fallzahlen/Berlin/berlin-hospital.csv src/assets
cp Fallzahlen/Other/*.csv src/assets

echo BUILD: Process DIVI Cases
# --- process DIVI cases for Berlin.
# 1. fetch existing csv's from SVN:
svn checkout --username $SVN_USER --password $SVN_PASSWORD --no-auth-cache --depth infinity \
    https://svn.vsp.tu-berlin.de/repos/public-svn/matsim/scenarios/countries/de/episim/original-data/Fallzahlen/DIVI/

echo BUILD: Scrape CSVs from DIVI site
# 2. scrape most recent csv from website:
cd DIVI/Daily_reports
export SRC="https://www.divi.de"
export FOLDER="/divi-intensivregister-tagesreport-archiv-csv"

wget -qO - ${SRC}${FOLDER} > datafile
grep "\"DIVI\-" < datafile > datafile2

head -1 datafile2 \
  | awk -v src=$SRC -F "\"" '// {print $4 ".csv", src $2}' \
  | xargs wget -qO

echo BUILD: Grep files into processed.csvs

BERLIN_CODE="11000"
printf "csv,gemeindeschluessel,anzahl_meldebereiche,faelle_covid_aktuell,faelle_covid_aktuell_beatmet,anzahl_standorte,betten_frei,betten_belegt,daten_stand\n" > ../berlin-divi-processed.csv
grep $BERLIN_CODE *.csv  |  sort  >>  ../berlin-divi-processed.csv

COLOGNE_CODE="5315"
printf "csv,gemeindeschluessel,anzahl_meldebereiche,faelle_covid_aktuell,faelle_covid_aktuell_beatmet,anzahl_standorte,betten_frei,betten_belegt,daten_stand\n" > ../cologne-divi-processed.csv
grep $COLOGNE_CODE *.csv  |  sort  >>  ../cologne-divi-processed.csv

MUNICH_CODE="9162"
printf "csv,gemeindeschluessel,anzahl_meldebereiche,faelle_covid_aktuell,faelle_covid_aktuell_beatmet,anzahl_standorte,betten_frei,betten_belegt,daten_stand\n" > ../munich-divi-processed.csv
grep $MUNICH_CODE *.csv  |  sort  >>  ../munich-divi-processed.csv

echo BUILD: svn add and commit

svn st | sed -rn '/^\?/s/^.{8}(.+)$/\1/p' | xargs -r svn add

cd ../..

svn st | sed -rn '/^\?/s/^.{8}(.+)$/\1/p' | xargs -r svn add
svn st | sed -rn '/^!/s/^.{8}(.+)$/\1/p' | xargs -r svn rm

svn commit --username $SVN_USER --password $SVN_PASSWORD  --no-auth-cache -m "DIVI autobuild: $TIMESTAMP" DIVI

# DONE WITH PREP! Build the site.
echo BUILD: Finally lets build the site
yarn install
yarn run build && yarn run test:unit


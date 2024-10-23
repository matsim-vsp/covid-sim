#!/usr/bin/env bash
# -----------------------------------------------------
# build-site.sh:
# copy files to the right places and then use yarn to build the site
# Requires $SVN_USER and $SVN_PASSWORD env variables
# -----------------------------------------------------
# set strict mode: fail smart, don't hide pipe errors
set -xeuo pipefail
IFS=$'\n\t'
# -----------------------------------------------------

TIMESTAMP=`date`

# RKI Abwasser ----------------------------------------
svn checkout --username $SVN_USER --password $SVN_PASSWORD --no-auth-cache --depth infinity \
    https://svn.vsp.tu-berlin.de/repos/public-svn/matsim/scenarios/countries/de/episim/original-data/Abwasser/

# fetch rki sewage data from GitHub into Abwasser/amelag_einzelstandorte.tsv
wget https://raw.githubusercontent.com/robert-koch-institut/Abwassersurveillance_AMELAG/main/amelag_einzelstandorte.tsv -O Abwasser/amelag_einzelstandorte.tsv

# add additional Abwasser cities here:
python3 scripts/sewage_data_parser.py -c Köln

svn commit --username $SVN_USER --password $SVN_PASSWORD  --no-auth-cache -m "autobuild: $TIMESTAMP" Abwasser

# RKI Infection Data ---------------------------------
echo BUILD: Getting RKI_FILE

RKI_FILE=https://media.githubusercontent.com/media/robert-koch-institut/SARS-CoV-2-Infektionen_in_Deutschland/main/Aktuell_Deutschland_SarsCov2_Infektionen.csv

wget -nv -O rki.csv $RKI_FILE
ls -al rki.csv
# Filter by IdLandkreis, AnzahlFall, Meldedatum, Refdatum
cut -d ',' -f 1,4,5,10 rki.csv > temp.csv
mv temp.csv rki.csv
head rki.csv

echo "FILTER the RKI csv file ---"
# NOTE: cut doesn't handle commas inside quotes! So the columns are off-by-one
# The "NeuGenesen" column in the cut output is ACTUALLY the RefDatum.
# cut -d "," -f3,4,7,9,15,16 < rki-all.csv > rki.csv
# head rki.csv
# ls -al rki.csv

# fetch the RKI hospitalization data from Github, data is in:
# https://github.com/robert-koch-institut/COVID-19-Hospitalisierungen_in_Deutschland

##  *** NOTE - BILLY COMMENTED THIS OUT 23-OCT-2024 because RKI deleted/moved these files:
##
## echo BUILD: Fetch latest RKI hospitalization stats from Github
## git clone https://github.com/robert-koch-institut/COVID-19-Hospitalisierungen_in_Deutschland COVID-Hospitalization
## cp -f COVID-Hospitalization/Archiv/`ls COVID-Hospitalization/Archiv | tail -1` src/assets/rki-deutschland-hospitalization.csv
##
## echo BUILD: Create [city]-cases.csv files
## # create the [city]-cases.csv files
## python3 --version
## echo Before rki-update.py
## python3 scripts/rki-update.py rki.csv
## echo After rki-update.py
##
## echo BUILD: Check out SVN and move *.csv files
## # put them in the right places
## svn checkout --username $SVN_USER --password $SVN_PASSWORD --no-auth-cache --depth infinity \
##    https://svn.vsp.tu-berlin.de/repos/public-svn/matsim/scenarios/countries/de/episim/original-data/Fallzahlen/
##
## cp *cases* src/assets
## cp *cases* Fallzahlen/RKI

# this should be unnecessary. Thanks RKI
mkdir -p Fallzahlen/RKI Fallzahlen/Berlin Fallzahlen/Other

echo BUILD: Fetch RKI Hospitalization cases from GitHub
wget https://github.com/robert-koch-institut/COVID-SARI-Hospitalisierungsinzidenz/raw/main/COVID-SARI-Hospitalisierungsinzidenz.tsv

cp COVID-SARI-* Fallzahlen/RKI

echo BUILD: Commit cases to SVN

svn commit --username $SVN_USER --password $SVN_PASSWORD  --no-auth-cache -m "autobuild: $TIMESTAMP" Fallzahlen

# Get hospital data too
cp Fallzahlen/Berlin/berlin-hospital.csv src/assets
cp Fallzahlen/Other/*.csv src/assets
cp Fallzahlen/RKI/COVID-SARI-* src/assets

echo BUILD: Process DIVI Cases

cd Fallzahlen/DIVI

# export SRC="https://diviexchange.blob.core.windows.net/%24web/zeitreihe-tagesdaten.csv"
export SRC="https://raw.githubusercontent.com/robert-koch-institut/Intensivkapazitaeten_und_COVID-19-Intensivbettenbelegung_in_Deutschland/0b98fce502cadcdab724abc456e80c02ba258c0a/Intensivregister_Landkreise_Kapazitaeten.csv"
export OUT="zeitreihe-tagesdaten.csv"
wget -qO - ${SRC} > $OUT

export HEADER=$(head -1 $OUT)

BERLIN_CODE="11000"
printf "$HEADER\n" > berlin-divi-processed.csv
grep $BERLIN_CODE $OUT | sort  >>  berlin-divi-processed.csv

COLOGNE_CODE="5315"
printf "$HEADER\n" > cologne-divi-processed.csv
grep $COLOGNE_CODE $OUT | sort  >>  cologne-divi-processed.csv

MUNICH_CODE="9162"
printf "$HEADER\n" > munich-divi-processed.csv
grep $MUNICH_CODE $OUT | sort  >>  munich-divi-processed.csv

svn commit --username $SVN_USER --password $SVN_PASSWORD  --no-auth-cache -m "Autobuild: $TIMESTAMP"

# Back to root folder
cd ../..

# Build docs first
cd docs
yarn
yarn build
cd ..

# DONE WITH PREP! Build the site.
echo BUILD: Run NODE/VITE builder
npm ci
npm run build

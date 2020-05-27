#!/usr/bin/env bash
# -----------------------------------------------------
# build-travis.sh:
# copy files to the right places and then use yarn to build the site
# Requires $SVN_USER and $SVN_PASSWORD env variables to be set
# -----------------------------------------------------
# set strict mode: fail smart, don't hide pipe errors
set -euo pipefail
IFS=$'\n\t'
# -----------------------------------------------------

RKI_FILE=https://www.arcgis.com/sharing/rest/content/items/f10774f1c63e40168479a1feb6c7ca74/data

wget -O rki.csv $RKI_FILE

# create the [city]-cases.csv files
python3 scripts/rki-update.py rki.csv

# put them in the right places
svn checkout --username $SVN_USER --password $SVN_PASSWORD --no-auth-cache --depth immediates \
    https://svn.vsp.tu-berlin.de/repos/public-svn/matsim/scenarios/countries/de/episim/original-data/Fallzahlen/RKI/

cp *cases* src/assets
cp *cases* RKI

TIMESTAMP=`date`
svn commit --username $SVN_USER --password $SVN_PASSWORD -m "RKI autobuild: $TIMESTAMP" RKI

yarn run build && yarn run test:unit

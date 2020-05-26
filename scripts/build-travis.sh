#!/usr/bin/env bash
# set strict mode: fail smart, don't hide pipe errors
set -euo pipefail
IFS=$'\n\t'
# --------------------------------

RKI_FILE=https://www.arcgis.com/sharing/rest/content/items/f10774f1c63e40168479a1feb6c7ca74/data

wget -O rki.csv $RKI_FILE
python scripts/rki-update.py rki.csv
cp *cases* src/assets

yarn run build && yarn run test:unit

#!/usr/bin/env bash

# Bash script to unzip, filter, and re-zip battery results

# set strict mode: fail smart, don't hide pipe errors
set -euo pipefail
IFS=$'\n\t'

# unzip summaries.zip

for each in `ls summaries/*infections.txt`; do
    echo $each
    head -1 $each > $each.csv
    cat $each | grep Berlin >> $each.csv
    #>> "$each.csv"

done



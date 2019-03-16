#!/usr/bin/env bash
# This script will delete all *.db files.
# Run this script from the root directory.
# Usage: bash scripts/drop_all_dbs.sh

echo "Are you sure you want to delete ALL the databases?"
find . -name "*.db" -type f
echo "If you are sure, type [YES]:"

read iamsure

if [ "$iamsure" == "YES" ]; then
  echo "Now deleting *.db"
  find . -name "*.db" -type f -delete
else
  echo "Exiting script"
fi

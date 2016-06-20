#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "----------------------------------------------------------------"
echo "demo_database recompile runner"
echo "Created with generator-pgsql"
echo "Build date: Mon Jun 20 2016 02:33:01 GMT-0300 (ART)"
echo "----------------------------------------------------------------"
echo
echo "----------------------------------------------------------------"
echo "Recompiling code objects for database demo_database..."
echo "----------------------------------------------------------------"
echo
$(locate bin/psql) -f $DIR/recompile.sql
echo
echo "----------------------------------------------------------------"
echo "Recompile runner has finished."
echo "----------------------------------------------------------------"

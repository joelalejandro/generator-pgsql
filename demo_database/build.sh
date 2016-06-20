#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "----------------------------------------------------------------"
echo "demo_database build runner"
echo "Created with generator-pgsql"
echo "Build date: Mon Jun 20 2016 02:32:29 GMT-0300 (ART)"
echo "----------------------------------------------------------------"
echo
echo "----------------------------------------------------------------"
echo "Building database demo_database..."
echo "----------------------------------------------------------------"
echo
$(locate bin/psql) -f $DIR/build.sql
echo
echo "----------------------------------------------------------------"
echo "Build runner has finished."
echo "----------------------------------------------------------------"

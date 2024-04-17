#!/usr/bin/env bash

#
# Simple build script that just copies the app into the build/ directory.
#

mkdir build/
rm -rf build/*
cp -r ./*.html ./*.css js/*.js js/graph/ js/queue/ build/
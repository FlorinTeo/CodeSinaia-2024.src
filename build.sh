#!/usr/bin/env bash

#
# Simple build script that just copies the app into the build/ directory.
#

rm -rf build
mkdir build/
cp -r GraphVisualizer/*.ico GraphVisualizer/*.html GraphVisualizer/*.css GraphVisualizer/js GraphVisualizer/res GraphVisualizer/data build/
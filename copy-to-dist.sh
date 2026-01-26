#!/bin/sh
set -e

mkdir -p ./dist
cp ./build/src/charlsjs.js ./dist
cp ./build/src/charlsjs.wasm ./dist

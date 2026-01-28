#!/bin/sh
# SPDX-FileCopyrightText: © 2026 Team CharLS
# SPDX-License-Identifier: BSD-3-Clause

# When running a local http server (for example python3 -m http.server), the server
# cannot access files outside the root folder. Therefore copy the built files to
# the test/browser/dist folder.

cp ./dist/charlsjs.js ./test/browser/dist/
cp ./dist/charlsjs.wasm ./test/browser/dist/
cp ./dist/JpegLSDecoder.js ./test/browser/dist/
cp ./dist/JpegLSEncoder.js ./test/browser/dist/

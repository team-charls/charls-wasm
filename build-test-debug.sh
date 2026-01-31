#!/bin/sh
# SPDX-FileCopyrightText: © 2026 Team CharLS
# SPDX-License-Identifier: BSD-3-Clause

mkdir -p build-debug
emcmake cmake -S . -B build-debug -D CMAKE_BUILD_TYPE=Debug
cmake --build build-debug -j ${nprocs}
npm test

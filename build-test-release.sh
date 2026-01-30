#!/bin/sh
# SPDX-FileCopyrightText: © 2026 Team CharLS
# SPDX-License-Identifier: BSD-3-Clause

mkdir -p build-release
emcmake cmake -S . -B build-release
cmake --build build-release -j ${nprocs}
npm test

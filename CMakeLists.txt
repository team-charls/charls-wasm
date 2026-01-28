# SPDX-FileCopyrightText: © 2020 Chris Hafey, Team CharLS
# SPDX-License-Identifier: BSD-3-Clause

cmake_minimum_required(VERSION 3.22...4.2)

project (charlsjs VERSION 0.8.0 LANGUAGES CXX)

set(DIST_DIR "${CMAKE_SOURCE_DIR}/dist")

configure_file(
    ${CMAKE_SOURCE_DIR}/npm/package.json.in
    ${DIST_DIR}/package.json
    @ONLY
)

# set the build type if not specified
set(default_build_type "Release")
if(NOT CMAKE_BUILD_TYPE AND NOT CMAKE_CONFIGURATION_TYPES)
  message(STATUS "Setting build type to '${default_build_type}' as none was specified.")
  set(CMAKE_BUILD_TYPE "${default_build_type}")
endif()

if(NOT EXISTS "${PROJECT_SOURCE_DIR}/extern/charls/CMakeLists.txt")
    message(FATAL_ERROR "dependency charls is not present, please run: git submodule update --init --recursive")
endif()

# add the external library
add_subdirectory(extern/charls EXCLUDE_FROM_ALL)

# add the js wrapper
if(EMSCRIPTEN)
  add_subdirectory(src)
endif()

# c++ native test case
if(NOT EMSCRIPTEN)
  add_subdirectory(test/cpp)
endif()
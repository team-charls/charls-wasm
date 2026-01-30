# SPDX-FileCopyrightText: © 2020 Chris Hafey, Team CharLS
# SPDX-License-Identifier: BSD-3-Clause

add_executable(charlsjs stub.cpp)

target_link_libraries(charlsjs PRIVATE charls)

target_compile_features(charlsjs PUBLIC cxx_std_17)

if (CMAKE_BUILD_TYPE STREQUAL Debug)
	SET(linkFlags "-g4")
else() # Either MinSizeRel, RelWithDebInfo or Release, all which run with optimizations enabled.
	SET(linkFlags "-O3")
endif()

set(CMAKE_CXX_FLAGS_RELEASE "-O3")

# Documentation for the Emscripten linker flags:
# https://emscripten.org/docs/tools_reference/settings_reference.html
# FILESYSTEM=0: Disable the virtual file system. Default is 1. CharLS doesn't use it.
# ASSERTIONS=0: Disable runtime assertions. Default is 1, unless -O1 or higher is used.
#               ASSERTIONS=2 adds extra checks, but may be slow.
# STACK_OVERFLOW_CHECK (default value is 1 for debug builds, 0 for others): Enable stack overflow checks.
# MALLOC=emmalloc: Use Emscripten's emmalloc implementation which is optimized for WebAssembly.
#                  Default is dlmalloc, debug build can use emmalloc-debug
# ENVIRONMENT = [web, node]: Specify the intended runtime environments. Default is [web, worker, node, shell].
# INITIAL_HEAP: Defines the initial size of the WebAssembly memory heap. Default is 16MB.
# ALLOW_MEMORY_GROWTH=1: Allow the WebAssembly memory to grow at runtime. Default is 0 (disabled).
# MODULARIZE=1: Generate the code as a module which can be instantiated.
# EXPORT_NAME=createCharLSModule: Name of the function to create the module instance.
# EXPORT_ES6=1: Generate the code as an ES6 module.

set_target_properties(
    charlsjs
    PROPERTIES
    LINK_FLAGS "\
      -fwasm-exceptions \
      -s MALLOC=emmalloc \
      -s ALLOW_MEMORY_GROWTH=1 \
      -s INITIAL_HEAP=262144000 \
      -s ASSERTIONS=0 \
      -s FILESYSTEM=0 \
      -s EXPORTED_FUNCTIONS=['_charls_jpegls_decoder_create','_charls_jpegls_decoder_destroy','_charls_jpegls_decoder_set_source_buffer','_charls_jpegls_decoder_read_header','_charls_jpegls_decoder_get_frame_info','_charls_jpegls_decoder_get_near_lossless','_charls_jpegls_decoder_get_interleave_mode','_charls_jpegls_decoder_get_destination_size','_charls_jpegls_decoder_decode_to_buffer','_charls_jpegls_encoder_create','_charls_jpegls_encoder_destroy','_charls_jpegls_encoder_set_frame_info','_charls_jpegls_encoder_set_near_lossless','_charls_jpegls_encoder_set_interleave_mode','_charls_jpegls_encoder_set_encoding_options','_charls_jpegls_encoder_get_estimated_destination_size','_charls_jpegls_encoder_set_destination_buffer','_charls_jpegls_encoder_encode_from_buffer','_charls_jpegls_encoder_get_bytes_written','_charls_jpegls_encoder_rewind','_charls_get_error_message','_charls_get_version_string','_malloc','_free'] \
      -s EXPORTED_RUNTIME_METHODS=['getValue','setValue','UTF8ToString','HEAPU8'] \
      -s ENVIRONMENT=[web,node] \
      -s MODULARIZE=1 \
      -s EXPORT_ES6=1 \
      -s EXPORT_NAME=createCharLSModule \
   ")

# Copy JavaScript wrapper files to the dist folder
add_custom_command(TARGET charlsjs POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E make_directory ${CMAKE_SOURCE_DIR}/dist
    COMMAND ${CMAKE_COMMAND} -E copy $<TARGET_FILE_DIR:charlsjs>/charlsjs.js ${CMAKE_SOURCE_DIR}/dist/
    COMMAND ${CMAKE_COMMAND} -E copy $<TARGET_FILE_DIR:charlsjs>/charlsjs.wasm ${CMAKE_SOURCE_DIR}/dist/
    COMMAND ${CMAKE_COMMAND} -E copy ${CMAKE_CURRENT_SOURCE_DIR}/jpegls-decoder.js ${CMAKE_SOURCE_DIR}/dist/
    COMMAND ${CMAKE_COMMAND} -E copy ${CMAKE_CURRENT_SOURCE_DIR}/jpegls-encoder.js ${CMAKE_SOURCE_DIR}/dist/
    COMMAND ${CMAKE_COMMAND} -E copy ${CMAKE_CURRENT_SOURCE_DIR}/jpegls-error.js ${CMAKE_SOURCE_DIR}/dist/
    COMMAND ${CMAKE_COMMAND} -E copy ${CMAKE_CURRENT_SOURCE_DIR}/index.js ${CMAKE_SOURCE_DIR}/dist/
    COMMAND ${CMAKE_COMMAND} -E copy ${CMAKE_SOURCE_DIR}/npm/README.md ${CMAKE_SOURCE_DIR}/dist/
    COMMAND ${CMAKE_COMMAND} -E copy ${CMAKE_SOURCE_DIR}/LICENSE.md ${CMAKE_SOURCE_DIR}/dist/
    COMMAND ${CMAKE_COMMAND} -E copy ${CMAKE_SOURCE_DIR}/CHANGELOG.md ${CMAKE_SOURCE_DIR}/dist/
    COMMENT "Copying build outputs, JS wrappers, README, LICENSE, and CHANGELOG to dist folder"
)

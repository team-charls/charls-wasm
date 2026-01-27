// SPDX-FileCopyrightText: © 2020 Chris Hafey, Team CharLS
// SPDX-License-Identifier: BSD-3-Clause

#include "JpegLSEncoder.hpp"

#include <emscripten.h>
#include <emscripten/bind.h>

using namespace emscripten;

static std::string getVersion() {
  std::string version = charls_get_version_string();
  return version;
}


EMSCRIPTEN_BINDINGS(charlsjs) {
    function("getVersion", &getVersion);
}

EMSCRIPTEN_BINDINGS(FrameInfo) {
  value_object<FrameInfo>("FrameInfo")
    .field("width", &FrameInfo::width)
    .field("height", &FrameInfo::height)
    .field("bitsPerSample", &FrameInfo::bitsPerSample)
    .field("componentCount", &FrameInfo::componentCount)
       ;
}

EMSCRIPTEN_BINDINGS(JpegLSEncoder) {
  class_<JpegLSEncoder>("JpegLSEncoder")
    .constructor<>()
    .function("getDecodedBuffer", &JpegLSEncoder::getDecodedBuffer)
    .function("getEncodedBuffer", &JpegLSEncoder::getEncodedBuffer)
    .function("setNearLossless", &JpegLSEncoder::setNearLossless)
    .function("setInterleaveMode", &JpegLSEncoder::setInterleaveMode)
    .function("encode", &JpegLSEncoder::encode)
   ;
}

<!--
  SPDX-FileCopyrightText: © 2020 Chris Hafey, Team CharLS
  SPDX-License-Identifier: BSD-3-Clause
-->

<table width="100%">
  <tr>
    <td align="left">
      <img src="https://raw.githubusercontent.com/team-charls/charls-wasm/main/assets/jpeg_ls_logo.png" alt="JPEG-LS Logo" width="100"/>
    </td>
    <td align="right">
      <img src="https://raw.githubusercontent.com/team-charls/charls-wasm/main/assets/webassembly.png" alt="Wasm Logo" width="100"/>
    </td>
  </tr>
</table>

# CharLS WebAssembly

[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://raw.githubusercontent.com/team-charls/charls-wasm/main/LICENSE.md)
[![REUSE status](https://api.reuse.software/badge/github.com/team-charls/charls-wasm)](https://api.reuse.software/info/github.com/team-charls/charls-wasm)
[![Build and test](https://github.com/team-charls/charls-wasm/actions/workflows/ci.yml/badge.svg)](https://github.com/team-charls/charls-wasm/actions/workflows/ci.yml)
![Deploy](https://github.com/team-charls/charls-wasm/actions/workflows/deploy.yml/badge.svg)

CharLS WebAssembly is a WebAssembly build of [CharLS](https://github.com/team-charls/charls).
This project was originally forked from [charls-js](https://github.com/chafey/charls-js), created by Chris Hafey. It has been updated to use Wasm 3.0 and the latest version of CharLS. Supported environments are browsers and Node.js.

## Try It Out!

Try it in your browser [here](https://team-charls.github.io/charls-wasm/)

## Supported platforms

All environments that can run Wasm 3.0 modules are supported.
Building charls-wasm itself is only supported on Linux platforms.

### Support Matrix

| Dimension     | Supported Version      | Scope |
|---------------|------------------------|-------|
| CharLS        | >= 3.0.0               | Development
| CMake         | >= 3.22                | Development
| Emscripten    | >= 4.0.23              | Development
| Chrome/Edge   | >= 137                 | Usage
| Firefox       | >= 131                 | Usage
| Safari        | >= 26.2                | Usage
| Node.js       | >= 18.0                | Usage

## Install

Install this in your JavaScript project using npm:

```bash
# NOTE - this is not published yet so won't work yet...
#npm install --save-dev charls-js
```

## Usage

Before using this library, you must wait for it to be initialized:

``` javascript
const charls = require('charlsjs')
charls.onRuntimeInitialized = async _ => {
    // Now you can use it
}
```

To decode a JPEG-LS image, create a decoder instance, copy the JPEG-LS bitstream
into its memory space, decode it, copy the decoded pixels out of its memory
space and finally, delete the decoder instance.

```javascript
function decode(jpeglsEncodedBitStream) {
  // Create a decoder instance
  const decoder = new charls.JpegLSDecoder();

  // get pointer to the source/encoded bit stream buffer in WASM memory
  // that can hold the encoded bitstream
  const encodedBufferInWASM = decoder.getEncodedBuffer(jpeglsEncodedBitStream.length);

  // copy the encoded bitstream into WASM memory buffer
  encodedBufferInWASM.set(jpeglsEncodedBitStream);

  // decode it
  decoder.decode();

  // get information about the decoded image
  const frameInfo = decoder.getFrameInfo();
  const interleaveMode = decoder.getInterleaveMode();
  const nearLossless = decoder.getNearLossless();

  // get the decoded pixels
  const decodedPixelsInWASM = decoder.getDecodedBuffer();

  // TODO: do something with the decoded pixels here (e.g. display them)
  // The pixel arrangement for color images varies depending upon the
  // interleaveMode parameter, see documentation in JpegLSDecode::getInterleaveMode()

  // delete the instance.  Note that this frees up memory including the
  // encodedBufferInWASM and decodedPixelsInWASM invalidating them.
  // Do not use either after calling delete!
  decoder.delete();
}

const jpeglsEncodedBitStream = // read from file, load from URL, etc
decode(jpeglsEncodedBitStream)
```

See examples for [browsers](test/browser/index.html) and [nodejs](test/node/index.js).
Also read the API documentation for [JpegLSDecoder.js](src/jpegls-decoder.js) and
[JpegLSEncoder.js](src/jpegls-encoder.js)

## Building

See information about building [here](BUILDING.md)

## Design

Read about the design considerations that went into this library [here](DESIGN.md)

## Performance

Read about the encode/decode performance of this library with NodeJS 14,
Google Chrome and FireFox vs Native [here](PERFORMANCE.md)
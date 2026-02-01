<!--
  SPDX-FileCopyrightText: © 2020 Chris Hafey, Team CharLS
  SPDX-License-Identifier: BSD-3-Clause
-->

<table width="100%">
  <tr>
    <td>
      <img src="https://raw.githubusercontent.com/team-charls/charls-wasm/main/assets/jpeg_ls_logo.png" alt="JPEG-LS Logo" width="100"/>
    </td>
    <td>
      <img src="https://raw.githubusercontent.com/team-charls/charls-wasm/main/assets/webassembly.png" alt="Wasm Logo" width="100"/>
    </td>
  </tr>
</table>

# CharLS WebAssembly

[![npm version](https://img.shields.io/npm/v/@team-charls/charls-wasm.svg)](https://www.npmjs.com/package/@team-charls/charls-wasm)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://raw.githubusercontent.com/team-charls/charls-wasm/main/LICENSE.md)
[![REUSE status](https://api.reuse.software/badge/github.com/team-charls/charls-wasm)](https://api.reuse.software/info/github.com/team-charls/charls-wasm)
[![Build and test](https://github.com/team-charls/charls-wasm/actions/workflows/ci.yml/badge.svg)](https://github.com/team-charls/charls-wasm/actions/workflows/ci.yml)
![Deploy](https://github.com/team-charls/charls-wasm/actions/workflows/deploy.yml/badge.svg)

CharLS WebAssembly is a WebAssembly build of [CharLS](https://github.com/team-charls/charls).
This project was originally forked from [charls-js](https://github.com/chafey/charls-js), created by Chris Hafey. It has been updated to use Wasm 3.0 and the latest version of CharLS. Supported environments are browsers and Node.js. See the Support Matrix for details.

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
npm install @team-charls/charls-wasm
```

## Usage

### Initialization
Before using this library, create the codec instances needed:

``` javascript
// For optimal performance, re-use the codec instances.
import { createJpegLSDecoder, createJpegLSEncoder } from '@team-charls/charls-wasm'
const decoder = await createJpegLSDecoder()
const encoder = await createJpegLSEncoder()
```

### Decoding
To decode a JPEG-LS image, use a pre-allocated or create a local decoder instance.
Use the single method decode or readHeader+decodeToBuffer.
The readHeader method allows more control and provides more feedback
to decide to decode or abort when reading untrusted images.

```javascript
function decode (jpeglsEncodedBuffer) {
  // Decode it
  const decodedPixelBuffer = decoder.decode(jpeglsEncodedBuffer)

  // Get information about the decoded image
  const frameInfo = decoder.getFrameInfo()
  const interleaveMode = decoder.getInterleaveMode()
  const nearLossless = decoder.getNearLossless()

  // Do something with the decoded pixels here (e.g. display them)
  // The pixel arrangement for color images varies depending upon the
  // interleaveMode parameter, see documentation in JpegLSDecoder::getInterleaveMode()
}

// Example usage:
// const jpeglsEncodedBuffer = ... // read from file, load from URL, etc
// decode(jpeglsEncodedBuffer)
```

### Encoding
To encode a file pass the buffer and the information about the image to the encoder.
```javascript
function encode (pixelBuffer, frameInfo) {
  const jpeglsEncodedBuffer = encoder.encode(
    pixelBuffer,
    frameInfo.width,
    frameInfo.height,
    frameInfo.bitsPerSample,
    frameInfo.componentCount,
    0, // Interleave mode (0 = none, 1 = line, 2 = sample)
    0, // Encoding options bitmask (0=none, 1=evenSize, 2=includeVersion, 4=includePCParametersJAI)
    0 // NEAR parameter (0 = lossless, >0 = near-lossless)
  )

  // Do something with the encoded data: save it to a file, decode it, etc.
  return jpeglsEncodedBuffer
}

// Example usage:
// encode(pixelBuffer, frameInfo)
```

### Disposing
For complex scenarios (long running applications) the method dispose
can be called to release allocated WASM memory.
``` javascript
// To explicitly release memory call dispose on the codec objects.
// When the Node.js application ends or the browser page is closed this
// is normally done automatically.
decoder.dispose()
encoder.dispose()
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
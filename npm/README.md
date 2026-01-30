<!--
  SPDX-FileCopyrightText: © 2020 Chris Hafey, Team CharLS
  SPDX-License-Identifier: BSD-3-Clause
-->

# CharLS WebAssembly

[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://raw.githubusercontent.com/team-charls/charls-wasm/main/LICENSE.md)

CharLS WebAssembly is a WebAssembly build of [CharLS](https://github.com/team-charls/charls), a high-performance JPEG-LS codec library. This package provides JavaScript/TypeScript bindings for encoding and decoding JPEG-LS images in both Node.js and browser environments.

This project was originally forked from [charls-js](https://github.com/chafey/charls-js), created by Chris Hafey. It has been updated to use Wasm 3.0 and the latest version of CharLS.

## Installation

```bash
npm install @team-charls/charls-wasm
```

## Quick Start

### Decoding a JPEG-LS Image

```javascript
import { createJpegLSDecoder } from '@team-charls/charls-wasm';

// Typical pattern is to re-use decoder instances for better performance.
const decoder = await createJpegLSDecoder();

function decodeImage(sourceBuffer) {
  const destinationBuffer = decoder.decode(sourceBuffer);

  console.log('Frame info:', decoder.getFrameInfo());
  console.log('Interleave mode:', decoder.getInterleaveMode());
  console.log('Near lossless:', decoder.getNearLossless());

  return destinationBuffer;
}
```

### Encoding to JPEG-LS

```javascript
import { createJpegLSEncoder } from '@team-charls/charls-wasm';

// Typical pattern is to re-use encoder instances for better performance.
const encoder = await createJpegLSEncoder();

function encodeImageLossless(pixelBuffer, frameInfo) {
  const destinationBuffer = encoder.encode(sourceBuffer,
    frameInfo.width,
    frameInfo.height,
    frameInfo.bitsPerSample,
    frameInfo.componentCount,
    0, // Interleave mode (0 = none, 1 = line, 2 = sample)
    0, // Encoding options bitmask (0=none, 1=evenSize, 2=includeVersion, 4=includePCParametersJAI)
    0, // NEAR parameter (0 = lossless, >0 = near-lossless)
  );

  return destinationBuffer;
}
```

## API Reference

### Factory Functions

- `createJpegLSDecoder()` - Creates a new decoder instance (async)
- `createJpegLSEncoder()` - Creates a new encoder instance (async)
- `initializeModule()` - Explicitly initialize the WASM module (optional, called automatically)

### Classes

- `JpegLSDecoder` - Decoder class for advanced usage
- `JpegLSEncoder` - Encoder class for advanced usage
- `JpegLSError` - Custom error class for JPEG-LS operations

## Supported Platforms

All environments that can run Wasm 3.0 modules are supported:

- **Browsers**: Chrome/Edge 137+, Firefox 131+, Safari 26.2+
- **Node.js**: 18.0+

## Examples

For complete examples, see:
- [Browser example](https://github.com/team-charls/charls-wasm/tree/main/test/browser)
- [Node.js example](https://github.com/team-charls/charls-wasm/tree/main/test/node)

## Resources

- [GitHub Repository](https://github.com/team-charls/charls-wasm)
- [CharLS C++ Library](https://github.com/team-charls/charls)
- [Live Demo](https://team-charls.github.io/charls-wasm/)
- [API Documentation](https://github.com/team-charls/charls-wasm/tree/main/src)

## License

BSD-3-Clause - See [LICENSE.md](https://github.com/team-charls/charls-wasm/blob/main/LICENSE.md)

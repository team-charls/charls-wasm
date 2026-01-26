// SPDX-FileCopyrightText: © 2020 Chris Hafey, Team CharLS
// SPDX-License-Identifier: BSD-3-Clause

/**
 * Example usage of JpegLSDecoderCApi with CharLS WASM module
 */

const JpegLSDecoderCApi = require('./JpegLSDecoderCApi.js');
const fs = require('fs');

// Assuming charlsModule is your loaded WASM module with exported C API functions
function decodeExample(charlsModule, pathToJPEGLSFile) {
  // Read the JPEG-LS encoded file
  const encodedData = fs.readFileSync(pathToJPEGLSFile);

  // Create decoder instance
  const decoder = new JpegLSDecoderCApi(charlsModule);

  try {
    // Get the encoded buffer and copy data into it
    const encodedBuffer = decoder.getEncodedBuffer(encodedData.length);
    encodedBuffer.set(encodedData);

    // Decode the image
    decoder.decode();

    // Get the decoded image information
    const frameInfo = decoder.getFrameInfo();
    console.log('Frame Info:', frameInfo);
    console.log('  Width:', frameInfo.width);
    console.log('  Height:', frameInfo.height);
    console.log('  Bits per sample:', frameInfo.bitsPerSample);
    console.log('  Component count:', frameInfo.componentCount);

    const interleaveMode = decoder.getInterleaveMode();
    console.log('Interleave Mode:', interleaveMode);
    console.log('  0 = planar (RRRGGGBBB)');
    console.log('  1 = line interleaved');
    console.log('  2 = sample interleaved (RGBRGBRGB)');

    const nearLossless = decoder.getNearLossless();
    console.log('Near Lossless:', nearLossless, nearLossless === 0 ? '(lossless)' : '(lossy)');

    // Get the decoded pixel data
    const decodedPixels = decoder.getDecodedBuffer();
    console.log('Decoded buffer size:', decodedPixels.length, 'bytes');

    // You can now use the decoded pixels
    // For example, save to a raw file:
    // fs.writeFileSync('output.raw', decodedPixels);

    return {
      frameInfo,
      interleaveMode,
      nearLossless,
      pixels: decodedPixels
    };

  } finally {
    // Always clean up to free memory
    decoder.delete();
  }
}

// Example: Load the WASM module and use it
// This assumes you have a way to load your CharLS WASM module
// For example with Emscripten's Module:
//
// const charlsModule = require('./charls-wasm.js');
// charlsModule.onRuntimeInitialized = () => {
//   const result = decodeExample(charlsModule, 'test.jls');
//   console.log('Decode complete!');
// };

module.exports = { decodeExample };

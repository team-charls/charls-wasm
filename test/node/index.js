// SPDX-FileCopyrightText: © 2020 Chris Hafey, Team CharLS
// SPDX-License-Identifier: BSD-3-Clause

import createCharLSModule from '../../dist/charlsjs.js';
import JpegLSDecoder from '../../dist/jpegls-decoder.js';
import JpegLSEncoder from '../../dist/jpegls-encoder.js';
import fs from 'fs';

let charlsModule;

async function main() {
  // Initialize the CharLS WASM module
  charlsModule = await createCharLSModule();
  console.log('CharLS module initialized');

  decode('../fixtures/ct1.jls');
  decode('../fixtures/ct2.jls');

  encode('../fixtures/ct2.raw', {width: 512, height: 512, bitsPerSample: 16, componentCount: 1});
}

function decode(pathToJpegLSFile, iterations = 10) {
  const sourceBuffer = fs.readFileSync(pathToJpegLSFile);
  const decoder = new JpegLSDecoder(charlsModule);

  // do the actual benchmark
  let destinationBuffer = null;
  const beginDecode = process.hrtime();
  for(var i=0; i < iterations; i++) {
    destinationBuffer = decoder.decode(sourceBuffer);
  }
  const decodeDuration = process.hrtime(beginDecode); // hrtime returns seconds/nanoseconds tuple
  const decodeDurationInSeconds = (decodeDuration[0] + (decodeDuration[1] / 1000000000));

  // Print out information about the decode
  console.log("Decode of " + pathToJpegLSFile + " took " + ((decodeDurationInSeconds / iterations * 1000)) + " ms");
  const frameInfo = decoder.getFrameInfo();
  console.log('  frameInfo = ', frameInfo);
  console.log('  decoded length = ', destinationBuffer.length);

  decoder.dispose();
}

function encode(pathToUncompressedImageFrame, imageFrame, iterations = 10) {
  const uncompressedImageFrame = fs.readFileSync(pathToUncompressedImageFrame);
  const encoder = new JpegLSEncoder(charlsModule);
  encoder.setNearLossless(0);

  let destinationBuffer = null;
  const encodeBegin = process.hrtime();
  for(var i=0; i < iterations;i++) {
    destinationBuffer = encoder.encode(
      uncompressedImageFrame,
      imageFrame.width,
      imageFrame.height,
      imageFrame.bitsPerSample,
      imageFrame.componentCount
    );
  }
  const encodeDuration = process.hrtime(encodeBegin);
  const encodeDurationInSeconds = (encodeDuration[0] + (encodeDuration[1] / 1000000000));

  // print out information about the encode
  console.log("Encode of " + pathToUncompressedImageFrame + " took " + ((encodeDurationInSeconds / iterations * 1000)) + " ms");
  console.log('  encoded length=', destinationBuffer.length)

  // cleanup allocated memory
  encoder.dispose();
}

main();

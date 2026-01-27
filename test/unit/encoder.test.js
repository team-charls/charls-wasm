// SPDX-FileCopyrightText: © 2026 Team CharLS
// SPDX-License-Identifier: BSD-3-Clause

import createCharLSModule from '../../dist/charlsjs.js';
import charlsJpegLSEncoder from '../../src/JpegLSEncoder.js';
import fs from 'fs';

let charlsModule;

beforeAll(async () => {
  charlsModule = await createCharLSModule({
  });
});


describe('JpegLSEncoder', () => {
  let encoder;

  beforeEach(() => {
    encoder = new charlsJpegLSEncoder(charlsModule);
  });

  afterEach(() => {
    if (encoder) {
      encoder.dispose();
    }
  });

  test('should create encoder instance from imported class', () => {
    expect(encoder).toBeDefined();
    expect(encoder).toBeInstanceOf(charlsJpegLSEncoder);
  });

  // test('decode', () => {
  //   const sourceBuffer = fs.readFileSync('./test/fixtures/jls/CT1.JLS');
  //   encoder.setSourceBuffer(sourceBuffer);
  //   encoder.readHeader();
  //   const destinationSize = encoder.getDestinationSize();
  //   expect(destinationSize).toBe(524288);

  //   const destinationBuffer = encoder.encodeToBuffer(destinationSize);
  //   expect(destinationBuffer).toBeDefined();
  //   expect(destinationBuffer.length).toBe(destinationSize);

  //   // TODO: further validate decoded data

  //   const frameInfo = decoder.getFrameInfo();
  //   expect(frameInfo).toBeDefined();
  //   expect(frameInfo.width).toBe(512);
  //   expect(frameInfo.height).toBe(512);
  //   expect(frameInfo.bitsPerSample).toBe(16);
  //   expect(frameInfo.componentCount).toBe(1);

  //   const interleaveMode = decoder.getInterleaveMode();
  //   expect(interleaveMode).toBe(0); // none

  //   const nearLossless = encoder.getNearLossless();
  //   expect(nearLossless).toBe(0);
  // });

  // test('decode with the decode method', () => {
  //   const sourceBuffer = fs.readFileSync('./test/fixtures/jls/CT1.JLS');
  //   const destinationBuffer = encoder.encode(sourceBuffer);
  //   expect(destinationBuffer).toBeDefined();

  //   // TODO: further validate decoded data

  //   const frameInfo = encoder.getFrameInfo();
  //   expect(frameInfo).toBeDefined();
  //   expect(frameInfo.width).toBe(512);
  //   expect(frameInfo.height).toBe(512);
  //   expect(frameInfo.bitsPerSample).toBe(16);
  //   expect(frameInfo.componentCount).toBe(1);

  //   const interleaveMode = decoder.getInterleaveMode();
  //   expect(interleaveMode).toBe(0); // none

  //   const nearLossless = decoder.getNearLossless();
  //   expect(nearLossless).toBe(0);
  // });


  // test('decode same image twice', () => {
  //   const sourceBuffer = fs.readFileSync('./test/fixtures/jls/CT1.JLS');
  //   decoder.setSourceBuffer(sourceBuffer);
  //   decoder.readHeader();
  //   let destinationSize = decoder.getDestinationSize();
  //   expect(destinationSize).toBe(524288);

  //   let destinationBuffer = decoder.decodeToBuffer(destinationSize);
  //   expect(destinationBuffer).toBeDefined();
  //   expect(destinationBuffer.length).toBe(destinationSize);

  //   // TODO: further validate decoded data

  //   const frameInfo = decoder.getFrameInfo();
  //   expect(frameInfo).toBeDefined();
  //   expect(frameInfo.width).toBe(512);
  //   expect(frameInfo.height).toBe(512);
  //   expect(frameInfo.bitsPerSample).toBe(16);
  //   expect(frameInfo.componentCount).toBe(1);

  //   decoder.reset();

  //   // Decode again
  //   decoder.setSourceBuffer(sourceBuffer);
  //   decoder.readHeader();
  //   destinationSize = decoder.getDestinationSize();
  //   expect(destinationSize).toBe(524288);

  //   destinationBuffer = encoder.encodeToBuffer(destinationSize);
  //   expect(destinationBuffer).toBeDefined();
  //   expect(destinationBuffer.length).toBe(destinationSize);
  // });
});

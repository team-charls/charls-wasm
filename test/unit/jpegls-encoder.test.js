// SPDX-FileCopyrightText: © 2026 Team CharLS
// SPDX-License-Identifier: BSD-3-Clause

import createCharLSModule from '../../dist/charlsjs.js';
import JpegLSEncoder from '../../dist/jpegls-encoder.js';
import JpegLSError from '../../dist/jpegls-error.js';
import fs from 'fs';

let charlsModule;

beforeAll(async () => {
  charlsModule = await createCharLSModule({
  });
});


describe('JpegLSEncoder', () => {
  let encoder;

  beforeEach(() => {
    encoder = new JpegLSEncoder(charlsModule);
  });

  afterEach(() => {
    if (encoder) {
      encoder.dispose();
    }
  });

  test('should create encoder instance from imported class', () => {
    expect(encoder).toBeDefined();
    expect(encoder).toBeInstanceOf(JpegLSEncoder);
  });

  test('encode', () => {
    const sourceBuffer = fs.readFileSync('./test/fixtures/ct2.raw');
    encoder.setFrameInfo(512, 512, 16, 1);
    encoder.setNearLossless(0);
    encoder.setInterleaveMode(0); // none
    encoder.setEncodingOptions(4); // INCLUDE_PC_PARAMETERS_JAI (to allow compare with ct2.jls)

    const destinationSize = encoder.getEstimatedDestinationSize();
    encoder.createDestinationBuffer(destinationSize);
    const destinationBuffer = encoder.encodeFromBuffer(sourceBuffer);

    const compareBuffer = fs.readFileSync('./test/fixtures/ct2.jls');
    compareBuffers(destinationBuffer, compareBuffer);
  });

  test('encode with the encode method', () => {
    const sourceBuffer = fs.readFileSync('./test/fixtures/ct2.raw');
    const destinationBuffer = encoder.encode(sourceBuffer, 512, 512, 16, 1, 0, 4, 0);

    const compareBuffer = fs.readFileSync('./test/fixtures/ct2.jls');
    compareBuffers(destinationBuffer, compareBuffer);
  });

  test('encode twice', () => {
    const sourceBuffer = fs.readFileSync('./test/fixtures/ct2.raw');
    const destinationBuffer0 = encoder.encode(sourceBuffer, 512, 512, 16, 1, 0, 4, 0);
    const destinationBuffer1 = encoder.encode(sourceBuffer, 512, 512, 16, 1, 0, 4, 0);

    const compareBuffer = fs.readFileSync('./test/fixtures/ct2.jls');
    compareBuffers(destinationBuffer0, compareBuffer);
    compareBuffers(destinationBuffer1, compareBuffer);
  });

  test('get version string', () => {
    const version = encoder.getVersion();
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  test('should throw error when invalid parameter is provided', () => {
    try {
      encoder.setInterleaveMode(99);
      fail('Expected exception');
    } catch (error) {
      expect(error).toBeInstanceOf(JpegLSError);
      expect(error.message).toMatch(/The interleave mode is not None*/);
      expect(error.code).toBe(106);
    }
  });

  function compareBuffers(actualBuffer, expectedBuffer) {
    expect(actualBuffer.length).toBe(expectedBuffer.length);

    // Use a manual loop to prevent that Jest hangs if the buffers are not equal
    for (let i = 0; i < actualBuffer.length; i++) {
      if (actualBuffer[i] !== expectedBuffer[i]) {
        expect(actualBuffer[i]).toBe(expectedBuffer[i]);
        break;
      }
    }
  }
});

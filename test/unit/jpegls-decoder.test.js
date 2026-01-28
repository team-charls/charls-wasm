// SPDX-FileCopyrightText: © 2026 Team CharLS
// SPDX-License-Identifier: BSD-3-Clause

import createCharLSModule from '../../dist/charlsjs.js';
import JpegLSDecoder from '../../dist/jpegls-decoder.js';
import fs from 'fs';

let charlsModule;

beforeAll(async () => {
  charlsModule = await createCharLSModule({
  });
});


describe('JpegLSDecoder', () => {
  let decoder;

  beforeEach(() => {
    decoder = new JpegLSDecoder(charlsModule);
  });

  afterEach(() => {
    if (decoder) {
      decoder.dispose();
    }
  });

  test('should create decoder instance from imported class', () => {
    expect(decoder).toBeDefined();
    expect(decoder).toBeInstanceOf(JpegLSDecoder);
  });

  test('decode', () => {
    const sourceBuffer = fs.readFileSync('./test/fixtures/ct2.jls');
    decoder.setSourceBuffer(sourceBuffer);
    decoder.readHeader();
    const destinationSize = decoder.getDestinationSize();
    expect(destinationSize).toBe(524288);

    const destinationBuffer = decoder.decodeToBuffer(destinationSize);
    expect(destinationBuffer).toBeDefined();
    expect(destinationBuffer.length).toBe(destinationSize);

    const compareBuffer = fs.readFileSync('./test/fixtures/ct2.raw');
    compareBuffers(destinationBuffer, compareBuffer);

    const frameInfo = decoder.getFrameInfo();
    expect(frameInfo).toBeDefined();
    expect(frameInfo.width).toBe(512);
    expect(frameInfo.height).toBe(512);
    expect(frameInfo.bitsPerSample).toBe(16);
    expect(frameInfo.componentCount).toBe(1);

    const interleaveMode = decoder.getInterleaveMode();
    expect(interleaveMode).toBe(0); // none

    const nearLossless = decoder.getNearLossless();
    expect(nearLossless).toBe(0);
  });

  test('decode with the decode method', () => {
    const sourceBuffer = fs.readFileSync('./test/fixtures/ct2.jls');
    const destinationBuffer = decoder.decode(sourceBuffer);
    expect(destinationBuffer).toBeDefined();

    const compareBuffer = fs.readFileSync('./test/fixtures/ct2.raw');
    compareBuffers(destinationBuffer, compareBuffer);

    const frameInfo = decoder.getFrameInfo();
    expect(frameInfo).toBeDefined();
    expect(frameInfo.width).toBe(512);
    expect(frameInfo.height).toBe(512);
    expect(frameInfo.bitsPerSample).toBe(16);
    expect(frameInfo.componentCount).toBe(1);

    const interleaveMode = decoder.getInterleaveMode();
    expect(interleaveMode).toBe(0); // none

    const nearLossless = decoder.getNearLossless();
    expect(nearLossless).toBe(0);
  });

  test('decode same image twice', () => {
    const sourceBuffer = fs.readFileSync('./test/fixtures/ct2.jls');
    decoder.setSourceBuffer(sourceBuffer);
    decoder.readHeader();
    let destinationSize = decoder.getDestinationSize();
    expect(destinationSize).toBe(524288);

    let destinationBuffer = decoder.decodeToBuffer(destinationSize);
    expect(destinationBuffer).toBeDefined();
    expect(destinationBuffer.length).toBe(destinationSize);

    const compareBuffer = fs.readFileSync('./test/fixtures/ct2.raw');
    compareBuffers(destinationBuffer, compareBuffer);

    const frameInfo = decoder.getFrameInfo();
    expect(frameInfo).toBeDefined();
    expect(frameInfo.width).toBe(512);
    expect(frameInfo.height).toBe(512);
    expect(frameInfo.bitsPerSample).toBe(16);
    expect(frameInfo.componentCount).toBe(1);

    decoder.reset();

    // Decode again
    decoder.setSourceBuffer(sourceBuffer);
    decoder.readHeader();
    destinationSize = decoder.getDestinationSize();
    expect(destinationSize).toBe(524288);

    destinationBuffer = decoder.decodeToBuffer(destinationSize);
    expect(destinationBuffer).toBeDefined();
    expect(destinationBuffer.length).toBe(destinationSize);
  });

  test('get version string', () => {
    const version = decoder.getVersion();
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
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

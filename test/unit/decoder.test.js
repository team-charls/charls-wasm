// SPDX-FileCopyrightText: © 2026 Team CharLS
// SPDX-License-Identifier: BSD-3-Clause

import createCharLSModule from '../../dist/charlsjs.js';
import charlsJpegLSDecoder from '../../src/JpegLSDecoder.js';
import fs from 'fs';

let charlsModule;

beforeAll(async () => {
  charlsModule = await createCharLSModule({
  });
});


describe('JpegLSDecoder', () => {
  let decoder;

  beforeEach(() => {
    decoder = new charlsJpegLSDecoder(charlsModule);
  });

  afterEach(() => {
    if (decoder) {
      decoder.dispose();
    }
  });

  test('should create decoder instance from imported class', () => {
    expect(decoder).toBeDefined();
    expect(decoder).toBeInstanceOf(charlsJpegLSDecoder);
  });

  test('decode', () => {
    const sourceBuffer = fs.readFileSync('./test/fixtures/jls/CT1.JLS');
    decoder.setSourceBuffer(sourceBuffer);
    decoder.readHeader();
    const destinationSize = decoder.getDestinationSize();
    expect(destinationSize).toBe(524288);

    const decodedBuffer = decoder.decodeToBuffer(destinationSize);
    expect(decodedBuffer).toBeDefined();
    expect(decodedBuffer.length).toBe(destinationSize);

    // TODO: further validate decoded data

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
});

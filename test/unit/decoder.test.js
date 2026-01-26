const charls = require('../../dist/charlsjs.js');

describe('JpegLSDecoder', () => {
  let decoder;

  beforeAll((done) => {
    charls.onRuntimeInitialized = () => {
      done();
    };
  });

  beforeEach(() => {
    decoder = new charls.JpegLSDecoder();
  });

  afterEach(() => {
    if (decoder) {
      decoder.delete();
    }
  });

  test('should create decoder instance', () => {
    expect(decoder).toBeDefined();
  });

  // test('should decode valid JPEG-LS image', () => {
  //   const encodedData = // load test image data
  //   const buffer = decoder.getEncodedBuffer(encodedData.length);
  //   buffer.set(encodedData);

  //   decoder.decode();

  //   const frameInfo = decoder.getFrameInfo();
  //   expect(frameInfo.width).toBeGreaterThan(0);
  //   expect(frameInfo.height).toBeGreaterThan(0);
  // });

  // Add more tests...
});
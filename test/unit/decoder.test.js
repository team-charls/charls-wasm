import createCharlsModule from '../../dist/charlsjs.js';

let charls;

beforeAll(async () => {
  charls = await createCharlsModule();
});

describe('JpegLSDecoder', () => {
  let decoder;

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
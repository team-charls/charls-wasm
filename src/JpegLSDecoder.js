// SPDX-FileCopyrightText: © 2020 Chris Hafey, Team CharLS
// SPDX-License-Identifier: BSD-3-Clause

/**
 * JavaScript wrapper class for CharLS JPEG-LS decoder using the standard C API
 * Assumes C API functions are exported from the WASM module
 */
class JpegLSDecoder {
  constructor(Module) {
    this.Module = Module;
    this.decoder = null;
    this.encodedBuffer = null;
    this.encodedBufferPtr = null;
    this.decodedBuffer = null;
    this.decodedBufferPtr = null;
    this.frameInfo = null;

    // Create decoder instance
    this.decoder = Module._charls_jpegls_decoder_create();
    if (!this.decoder) {
      throw new Error('Failed to create JPEG-LS decoder');
    }
  }

  /**
   * Allocates and returns a Uint8Array for the encoded JPEG-LS bitstream
   * @param {number} size - Size of the encoded buffer in bytes
   * @returns {Uint8Array} TypedArray view of the allocated WASM memory
   */
  getEncodedBuffer(size) {
    // Free previous buffer if it exists
    if (this.encodedBufferPtr) {
      this.Module._free(this.encodedBufferPtr);
    }

    // Allocate new buffer in WASM memory
    this.encodedBufferPtr = this.Module._malloc(size);
    if (!this.encodedBufferPtr) {
      throw new Error('Failed to allocate encoded buffer');
    }

    // Create a Uint8Array view
    this.encodedBuffer = new Uint8Array(
      this.Module.HEAPU8.buffer,
      this.encodedBufferPtr,
      size
    );

    return this.encodedBuffer;
  }

  /**
   * Returns a Uint8Array view of the decoded pixel data
   * Must be called after decode()
   * @returns {Uint8Array} TypedArray view of the decoded pixels
   */
  getDecodedBuffer() {
    if (!this.decodedBuffer) {
      throw new Error('No decoded buffer available. Call decode() first.');
    }
    return this.decodedBuffer;
  }

  /**
   * Decodes the JPEG-LS bitstream
   * The encoded buffer must be populated before calling this method
   */
  decode() {
    if (!this.encodedBuffer) {
      throw new Error('No encoded buffer set. Call getEncodedBuffer() first.');
    }

    // Set source buffer
    let error = this.Module._charls_jpegls_decoder_set_source_buffer(
      this.decoder,
      this.encodedBufferPtr,
      this.encodedBuffer.length
    );
    this._checkError(error, 'Failed to set source buffer');

    // Read header
    error = this.Module._charls_jpegls_decoder_read_header(this.decoder);
    this._checkError(error, 'Failed to read header');

    // Get frame info
    const frameInfoPtr = this.Module._malloc(16); // sizeof(charls_frame_info)
    try {
      error = this.Module._charls_jpegls_decoder_get_frame_info(
        this.decoder,
        frameInfoPtr
      );
      this._checkError(error, 'Failed to get frame info');

      // Read frame info struct
      this.frameInfo = {
        width: this.Module.getValue(frameInfoPtr, 'i32'),
        height: this.Module.getValue(frameInfoPtr + 4, 'i32'),
        bitsPerSample: this.Module.getValue(frameInfoPtr + 8, 'i32'),
        componentCount: this.Module.getValue(frameInfoPtr + 12, 'i32')
      };
    } finally {
      this.Module._free(frameInfoPtr);
    }

    // Get near lossless parameter (component 0)
    const nearLosslessPtr = this.Module._malloc(4);
    try {
      error = this.Module._charls_jpegls_decoder_get_near_lossless(
        this.decoder,
        0,
        nearLosslessPtr
      );
      this._checkError(error, 'Failed to get near lossless');
      this.nearLossless = this.Module.getValue(nearLosslessPtr, 'i32');
    } finally {
      this.Module._free(nearLosslessPtr);
    }

    // Get interleave mode (component 0)
    const interleaveModePtr = this.Module._malloc(4);
    try {
      error = this.Module._charls_jpegls_decoder_get_interleave_mode(
        this.decoder,
        0,
        interleaveModePtr
      );
      this._checkError(error, 'Failed to get interleave mode');
      this.interleaveMode = this.Module.getValue(interleaveModePtr, 'i32');
    } finally {
      this.Module._free(interleaveModePtr);
    }

    // Get destination size
    const destinationSizePtr = this.Module._malloc(8); // size_t
    try {
      error = this.Module._charls_jpegls_decoder_get_destination_size(
        this.decoder,
        0,
        destinationSizePtr
      );
      this._checkError(error, 'Failed to get destination size');

      // Read size_t (could be 32 or 64 bit depending on platform)
      const destinationSize = this.Module.getValue(destinationSizePtr, 'i32');

      // Allocate decoded buffer
      this.decodedBufferPtr = this.Module._malloc(destinationSize);
      if (!this.decodedBufferPtr) {
        throw new Error('Failed to allocate decoded buffer');
      }

      // Decode to buffer
      error = this.Module._charls_jpegls_decoder_decode_to_buffer(
        this.decoder,
        this.decodedBufferPtr,
        destinationSize,
        0
      );
      this._checkError(error, 'Failed to decode');

      // Create Uint8Array view of decoded data
      this.decodedBuffer = new Uint8Array(
        this.Module.HEAPU8.buffer,
        this.decodedBufferPtr,
        destinationSize
      );
    } finally {
      this.Module._free(destinationSizePtr);
    }
  }

  /**
   * Returns the frame information
   * @returns {Object} Frame info with width, height, bitsPerSample, componentCount
   */
  getFrameInfo() {
    if (!this.frameInfo) {
      throw new Error('No frame info available. Call decode() first.');
    }
    return this.frameInfo;
  }

  /**
   * Returns the interleave mode
   * 0 = none (planar), 1 = line, 2 = sample
   * @returns {number}
   */
  getInterleaveMode() {
    if (this.interleaveMode === undefined) {
      throw new Error('No interleave mode available. Call decode() first.');
    }
    return this.interleaveMode;
  }

  /**
   * Returns the NEAR parameter (0 = lossless, > 0 = lossy)
   * @returns {number}
   */
  getNearLossless() {
    if (this.nearLossless === undefined) {
      throw new Error('No near lossless value available. Call decode() first.');
    }
    return this.nearLossless;
  }

  /**
   * Cleans up and frees all allocated memory
   * Must be called when done using the decoder
   */
  delete() {
    if (this.decodedBufferPtr) {
      this.Module._free(this.decodedBufferPtr);
      this.decodedBufferPtr = null;
      this.decodedBuffer = null;
    }

    if (this.encodedBufferPtr) {
      this.Module._free(this.encodedBufferPtr);
      this.encodedBufferPtr = null;
      this.encodedBuffer = null;
    }

    if (this.decoder) {
      this.Module._charls_jpegls_decoder_destroy(this.decoder);
      this.decoder = null;
    }
  }

  /**
   * Checks for errors and throws if error code is not success
   * @private
   */
  _checkError(errorCode, message) {
    if (errorCode !== 0) { // CHARLS_JPEGLS_ERRC_SUCCESS = 0
      const errorMessage = this.Module._charls_get_error_message(errorCode);
      const errorString = errorMessage ?
        this.Module.UTF8ToString(errorMessage) :
        `Error code ${errorCode}`;
      throw new Error(`${message}: ${errorString}`);
    }
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JpegLSDecoder;
}

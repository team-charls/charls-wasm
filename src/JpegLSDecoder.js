// SPDX-FileCopyrightText: © 2026 Team CharLS
// SPDX-License-Identifier: BSD-3-Clause

/**
 * JavaScript wrapper class for CharLS JPEG-LS decoder using the standard C API
 * Assumes C API functions are exported from the WASM module
 */
class JpegLSDecoder {
  #module = null;
  #decoder = null;
  #sourceBufferPtr = null;
  #destinationBufferPtr = null;
  #ui32Ptr = null;
  #frameInfoPtr = null;

  constructor(module) {
    this.#module = module;

    this.#decoder = module._charls_jpegls_decoder_create();
    if (!this.#decoder) {
      throw new Error('Failed to create WASM JPEG-LS decoder');
    }

    this.#ui32Ptr = this.#malloc(4);
    this.#frameInfoPtr = this.#malloc(16); // sizeof(charls_frame_info)
  }


  /**
   * Cleans up and frees all allocated memory
   * Must be called when done using the decoder
   */
  dispose() {
    if (this.#destinationBufferPtr) {
      this.#module._free(this.#destinationBufferPtr);
      this.#destinationBufferPtr = null;
    }

    if (this.#sourceBufferPtr) {
      this.#module._free(this.#sourceBufferPtr);
      this.#sourceBufferPtr = null;
    }

    this.#module._free(this.#frameInfoPtr);
    this.#frameInfoPtr = null;
    this.#module._free(this.#ui32Ptr);
    this.#ui32Ptr = null;
    this.#module._charls_jpegls_decoder_destroy(this.#decoder);
    this.#decoder = null;
  }


  setSourceBuffer(source) {
    if (this.#sourceBufferPtr) {
      this.#module._free(this.#sourceBufferPtr);
    }

    // Allocate new buffer in WASM memory
    this.#sourceBufferPtr = this.#module._malloc(source.length);
    if (!this.#sourceBufferPtr) {
      throw new Error('Failed to allocate encoded buffer');
    }

    // Create a Uint8Array view
    let sourceBuffer = new Uint8Array(
      this.#module.HEAPU8.buffer,
      this.#sourceBufferPtr,
      source.length
    );

    // Copy source data into the allocated buffer
    sourceBuffer.set(source);

    this.#checkError(this.#module._charls_jpegls_decoder_set_source_buffer(
      this.#decoder,
      this.#sourceBufferPtr,
      sourceBuffer.length
    ));
  }


  readHeader() {
    this.#checkError(this.#module._charls_jpegls_decoder_read_header(this.#decoder));
  }


  getDestinationSize() {
    this.#checkError(this.#module._charls_jpegls_decoder_get_destination_size(
      this.#decoder,
      0,
      this.#ui32Ptr
    ));

    return this.#module.getValue(this.#ui32Ptr, 'i32');
  }


  decodeToBuffer(destinationSize) {
    if (this.#destinationBufferPtr) {
      this.#module._free(this.#destinationBufferPtr);
    }
    this.#destinationBufferPtr = this.#malloc(destinationSize);

    // Decode to buffer
    this.#checkError(this.#module._charls_jpegls_decoder_decode_to_buffer(
      this.#decoder,
      this.#destinationBufferPtr,
      destinationSize,
      0
    ));

    // Create Uint8Array view of decoded data (no copy)
    const destinationBuffer = new Uint8Array(
      this.#module.HEAPU8.buffer,
      this.#destinationBufferPtr,
      destinationSize
    );

    return destinationBuffer;
  }


  /**
   * Returns the frame information
   * @returns {Object} Frame info with width, height, bitsPerSample, componentCount
   */
  getFrameInfo() {
      this.#checkError(this.#module._charls_jpegls_decoder_get_frame_info(
        this.#decoder,
        this.#frameInfoPtr
      ));

      return Object.freeze({
        width: this.#module.getValue(this.#frameInfoPtr, 'i32'),
        height: this.#module.getValue(this.#frameInfoPtr + 4, 'i32'),
        bitsPerSample: this.#module.getValue(this.#frameInfoPtr + 8, 'i32'),
        componentCount: this.#module.getValue(this.#frameInfoPtr + 12, 'i32')
      });
  }


  /**
   * Returns the interleave mode
   * 0 = none (planar), 1 = line, 2 = sample
   * @returns {number}
   */
  getInterleaveMode() {
    this.#checkError(this.#module._charls_jpegls_decoder_get_interleave_mode(
      this.#decoder,
      0,
      this.#ui32Ptr
    ));
    return this.#module.getValue(this.#ui32Ptr, 'i32');
  }


  /**
   * Returns the NEAR parameter (0 = lossless, > 0 = lossy)
   * @returns {number}
   */
  getNearLossless() {
    this.#checkError(this.#module._charls_jpegls_decoder_get_near_lossless(
      this.#decoder,
      0,
      this.#ui32Ptr
    ));
    return this.#module.getValue(this.#ui32Ptr, 'i32');
  }


  #checkError(errorCode) {
    if (errorCode !== 0) { // CHARLS_JPEGLS_ERRC_SUCCESS = 0
      const errorMessage = this.#module.UTF8ToString(this.#module._charls_get_error_message(errorCode));
      throw new Error(`errorCode: ${errorMessage}`);
    }
  }


  #malloc(size) {
    const ptr = this.#module._malloc(size);
    if (!ptr) {
      throw new Error('Failed to allocate buffer');
    }
    return ptr;
  }
}


export default JpegLSDecoder;

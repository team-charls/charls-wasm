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
  #sourceBufferSize = 0;
  #destinationBufferPtr = null;
  #destinationBufferSize = 0;
  #ui32Ptr = null;
  #frameInfoPtr = null;
  #resetNeeded = false;

  /**
   * Creates a new JPEG-LS decoder instance
   * @param {object} module - The CharLS WASM module
   * @throws {Error} If decoder creation fails
   */
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
   * Cleans up and frees all allocated memory.
   * Must be called when done using the decoder to prevent memory leaks.
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


  /**
   * Resets the decoder state to allow decoding another frame.
   * @throws {Error} If decoder recreation fails
   */
  reset() {
    if (this.#resetNeeded) {
      this.#module._charls_jpegls_decoder_destroy(this.#decoder);
      this.#decoder = this.#module._charls_jpegls_decoder_create();
      if (!this.#decoder) {
        throw new Error('Failed to create WASM JPEG-LS decoder');
      }
      this.#resetNeeded = false;
    }
  }


  /**
   * Decodes a JPEG-LS encoded buffer in a single call.
   * Convenience method that combines reset, setSourceBuffer, readHeader, and decodeToBuffer.
   * @param {Uint8Array} sourceBuffer - The encoded JPEG-LS data
   * @returns {Uint8Array} View of the decoded pixel data
   * @throws {Error} If any step of the decoding process fails
   */
  decode(sourceBuffer) {
    this.reset();
    this.setSourceBuffer(sourceBuffer);
    this.readHeader();
    const destinationSize = this.getDestinationSize();
    return this.decodeToBuffer(destinationSize);
  }


  /**
   * Sets the source buffer containing the encoded JPEG-LS bitstream.
   * @param {Uint8Array} sourceBuffer - The encoded JPEG-LS data
   * @throws {Error} If buffer setup or validation fails
   */
  setSourceBuffer(sourceBuffer) {
    if (this.#sourceBufferPtr === null) {
      this.#sourceBufferPtr = this.#malloc(sourceBuffer.length);
      this.#sourceBufferSize = sourceBuffer.length;
    }
    else if (sourceBuffer.length > this.#sourceBufferSize) {
      this.#module._free(this.#sourceBufferPtr);
      this.#sourceBufferPtr = this.#malloc(sourceBuffer.length);
      this.#sourceBufferSize = sourceBuffer.length;
    }

    // Create a Uint8Array view
    let sourceBufferView = new Uint8Array(
      this.#module.HEAPU8.buffer,
      this.#sourceBufferPtr,
      sourceBuffer.length
    );

    // Copy source data into the allocated buffer
    sourceBufferView.set(sourceBuffer);

    this.#checkError(this.#module._charls_jpegls_decoder_set_source_buffer(
      this.#decoder,
      this.#sourceBufferPtr,
      sourceBufferView.length
    ));
  }


  /**
   * Reads and parses the JPEG-LS header from the source buffer.
   * Must be called after setSourceBuffer and before decodeToBuffer.
   * @throws {Error} If header parsing fails
   */
  readHeader() {
    this.#resetNeeded = true;
    this.#checkError(this.#module._charls_jpegls_decoder_read_header(this.#decoder));
  }


  /**
   * Gets the required size for the destination buffer to hold the decoded pixel data.
   * Must be called after readHeader.
   * @returns {number} Size in bytes needed for the decoded buffer
   * @throws {Error} If size query fails
   */
  getDestinationSize() {
    this.#checkError(this.#module._charls_jpegls_decoder_get_destination_size(
      this.#decoder,
      0,
      this.#ui32Ptr
    ));

    return this.#module.getValue(this.#ui32Ptr, 'i32');
  }


  /**
   * Decodes the JPEG-LS bitstream into the destination buffer.
   * Must be called after readHeader.
   * @param {number} destinationSize - The size of the destination buffer (from getDestinationSize)
   * @returns {Uint8Array} View of the decoded pixel data
   * @throws {Error} If decoding fails
   */
  decodeToBuffer(destinationSize) {
    if (this.#destinationBufferPtr === null) {
      this.#destinationBufferPtr = this.#malloc(destinationSize);
      this.#destinationBufferSize = destinationSize;
    } else if (destinationSize > this.#destinationBufferSize) {
      this.#module._free(this.#destinationBufferPtr);
      this.#destinationBufferPtr = this.#malloc(destinationSize);
      this.#destinationBufferSize = destinationSize;
    }

    // Decode to buffer
    this.#checkError(this.#module._charls_jpegls_decoder_decode_to_buffer(
      this.#decoder,
      this.#destinationBufferPtr,
      destinationSize,
      0
    ));

    // Create Uint8Array view of decoded data (no copy)
    const destinationBufferView = new Uint8Array(
      this.#module.HEAPU8.buffer,
      this.#destinationBufferPtr,
      destinationSize
    );

    return destinationBufferView;
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


  /**
   * Checks for errors and throws if error code is not success.
   * @private
   * @param {number} errorCode - The error code from a C API function
   * @throws {Error} If errorCode is not 0 (success)
   */
  #checkError(errorCode) {
    if (errorCode !== 0) { // CHARLS_JPEGLS_ERRC_SUCCESS = 0
      const errorMessage = this.#module.UTF8ToString(this.#module._charls_get_error_message(errorCode));
      throw new Error(`errorCode: ${errorCode}, message: ${errorMessage}`);
    }
  }


  /**
   * Allocates memory in WASM and returns a pointer.
   * @private
   * @param {number} size - Size in bytes to allocate
   * @returns {number} Pointer to allocated memory
   * @throws {Error} If allocation fails
   */
  #malloc(size) {
    const ptr = this.#module._malloc(size);
    if (!ptr) {
      throw new Error('Failed to allocate buffer');
    }
    return ptr;
  }
}


export default JpegLSDecoder;

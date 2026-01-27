// SPDX-FileCopyrightText: © 2026 Team CharLS
// SPDX-License-Identifier: BSD-3-Clause

/**
 * JavaScript wrapper class for CharLS JPEG-LS encoder using the standard C API
 */
class JpegLSEncoder {
  #module = null;
  #encoder = null;
  #sourceBufferPtr = null;
  #sourceBufferSize = 0;
  #destinationBufferPtr = null;
  #destinationBufferSize = 0;
  #ui32Ptr = null;
  #frameInfoPtr = null;
  //#resetNeeded = false;

  /**
   * Creates a new JPEG-LS encoder instance
   * @param {object} module - The CharLS WASM module
   * @throws {Error} If encoder creation fails
   */
  constructor(module) {
    this.#module = module;

    this.#encoder = module._charls_jpegls_encoder_create();
    if (!this.#encoder) {
      throw new Error('Failed to create WASM JPEG-LS encoder');
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
    this.#module._charls_jpegls_encoder_destroy(this.#encoder);
    this.#encoder = null;
  }


  /**
   * Resets the decoder state to allow decoding another frame.
   * @throws {Error} If decoder recreation fails
   */
  // reset() {
  //   if (this.#resetNeeded) {
  //     this.#module._charls_jpegls_decoder_destroy(this.#decoder);
  //     this.#decoder = this.#module._charls_jpegls_decoder_create();
  //     if (!this.#decoder) {
  //       throw new Error('Failed to create WASM JPEG-LS decoder');
  //     }
  //     this.#resetNeeded = false;
  //   }
  // }


  setFrameInfo(width, height, bitsPerSample, componentCount) {
    this.#module.setValue(this.#frameInfoPtr, width, 'i32');
    this.#module.setValue(this.#frameInfoPtr + 4, height, 'i32');
    this.#module.setValue(this.#frameInfoPtr + 8, bitsPerSample, 'i32');
    this.#module.setValue(this.#frameInfoPtr + 12, componentCount, 'i32');

    this.#checkError(this.#module._charls_jpegls_encoder_set_frame_info(
      this.#encoder,
      this.#frameInfoPtr
    ));
  }


  /**
   * Sets the interleave mode
   * 0 = none (planar), 1 = line, 2 = sample
   * @returns {number}
   */
  setInterleaveMode(interleaveMode) {
    this.#module.setValue(this.#ui32Ptr, interleaveMode, 'i32');

    this.#checkError(this.#module._charls_jpegls_encoder_set_interleave_mode(
      this.#encoder,
      this.#ui32Ptr
    ));
  }


  /**
   * Sets the NEAR parameter (0 = lossless, > 0 = lossy)
   * @returns {number}
   */
  setNearLossless(nearLossless) {
    this.#module.setValue(this.#ui32Ptr, nearLossless, 'i32');

    this.#checkError(this.#module._charls_jpegls_encoder_set_near_lossless(
      this.#encoder,
      this.#ui32Ptr
    ));
  }


  getEstimatedDestinationSize() {
    this.#checkError(this.#module._charls_jpegls_encoder_get_estimated_destination_size(
      this.#encoder,
      this.#ui32Ptr
    ));
    return this.#module.getValue(this.#ui32Ptr, 'i32');
  }


  setDestinationBuffer(destinationSize) {
    if (this.#destinationBufferPtr === null) {
      this.#destinationBufferPtr = this.#malloc(destinationSize);
      this.#destinationBufferSize = destinationSize;
    }
    else if (destinationSize > this.#destinationBufferSize) {
      this.#module._free(this.#destinationBufferPtr);
      this.#destinationBufferPtr = this.#malloc(destinationSize);
      this.#destinationBufferSize = destinationSize;
    }

    // // Create a Uint8Array view
    // let sourceBufferView = new Uint8Array(
    //   this.#module.HEAPU8.buffer,
    //   this.#Destination2BufferPtr,
    //   sourceBuffer.length
    // );

    // Copy source data into the allocated buffer
    //sourceBufferView.set(sourceBuffer);

    this.#checkError(this.#module._charls_jpegls_encoder_set_destination_buffer(
      this.#encoder,
      this.#destinationBufferPtr,
      destinationSize
    ));
  }


  encodeFromBuffer(sourceBuffer) {
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

    this.#checkError(this.#module.charls_jpegls_encoder_encode_from_buffer(
      this.#encoder,
      this.#sourceBufferPtr,
      sourceBuffer.length,
      0
    ));

    //return bytes_written();
  }


  encode(sourceBuffer) {
    //this.reset();
    // this.setSourceBuffer(sourceBuffer);
    // this.readHeader();
    // const destinationSize = this.getDestinationSize();
    // return this.decodeToBuffer(destinationSize);
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
      throw new Error(`errorCode: ${errorMessage}`);
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


export default JpegLSEncoder;

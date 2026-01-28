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
  #destinationBufferView = null;
  #ui32Ptr = null;
  #frameInfoPtr = null;

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
   * Must be called when done using the encoder to prevent memory leaks.
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
   * Rewind the encoder to encode a new frame with the same parameters.
   * @throws {Error} If rewind operation fails
   */
  rewind() {
    this.#checkError(this.#module._charls_jpegls_encoder_rewind(
      this.#encoder
    ));
  }


  /**
   * Encodes an image buffer to JPEG-LS format.
   * The returned Uint8Array is a view over the internal destination buffer, which remains valid until the next encode call or dispose.
   * @param {Buffer|Uint8Array} sourceBuffer - The image data to encode
   * @param {number} width - Image width in pixels
   * @param {number} height - Image height in pixels
   * @param {number} bitsPerSample - Bits per sample (e.g., 8 or 16)
   * @param {number} componentCount - Number of color components (1 for grayscale, 3 for RGB, etc.)
   * @param {number} [interleaveMode=0] - Interleave mode (0=none, 1=line, 2=sample)
   * @param {number} [encodingOptions=0] - Encoding options bitmask
   * @param {number} [nearLossless=0] - NEAR parameter (0=lossless, >0=lossy)
   * @returns {Uint8Array} Encoded JPEG-LS data
   * @throws {Error} If encoding fails
   */
  encode(sourceBuffer, width, height, bitsPerSample, componentCount, interleaveMode = 0, encodingOptions = 0, nearLossless = 0) {
    this.rewind();
    this.setFrameInfo(width, height, bitsPerSample, componentCount);
    this.setInterleaveMode(interleaveMode);
    this.setEncodingOptions(encodingOptions);
    this.setNearLossless(nearLossless);

    const destinationSize = this.getEstimatedDestinationSize();
    this.createDestinationBuffer(destinationSize);
    return this.encodeFromBuffer(sourceBuffer);
  }


  /**
   * Sets the frame information (image dimensions and sample format).
   * @param {number} width - Image width in pixels
   * @param {number} height - Image height in pixels
   * @param {number} bitsPerSample - Bits per sample (e.g., 8 or 16)
   * @param {number} componentCount - Number of color components, 1 for grayscale, 3 for RGB, etc.
   * @throws {Error} If frame info cannot be set
   */
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
   * Sets the NEAR parameter for lossy encoding (0 = lossless, > 0 = lossy).
   * @param {number} nearLossless - NEAR value (0 for lossless, 1-255 for lossy)
   * @throws {Error} If NEAR value cannot be set
   */
  setNearLossless(nearLossless) {
    this.#checkError(this.#module._charls_jpegls_encoder_set_near_lossless(
      this.#encoder,
      nearLossless
    ));
  }


  /**
   * Sets the interleave mode for multi-component images.
   * @param {number} interleaveMode - 0 = none (planar), 1 = line, 2 = sample
   * @throws {Error} If interleave mode cannot be set
   */
  setInterleaveMode(interleaveMode) {
    this.#checkError(this.#module._charls_jpegls_encoder_set_interleave_mode(
      this.#encoder,
      interleaveMode
    ));
  }


  /**
   * Sets the encoding options (bitmask for additional encoding parameters).
   * @param {number} encodingOptions - 0 = none, 1 = EVEN_DESTINATION_SIZE = 1, 2 = INCLUDE_VERSION_NUMBER, 4 = INCLUDE_PC_PARAMETERS_JAI (for JAI compatibility)
   * @throws {Error} If encoding options cannot be set
   */
  setEncodingOptions(encodingOptions) {
    this.#checkError(this.#module._charls_jpegls_encoder_set_encoding_options(
      this.#encoder,
      encodingOptions
    ));
  }


  /**
   * Gets the estimated size needed for the encoded output buffer.
   * @returns {number} Estimated destination buffer size in bytes
   * @throws {Error} If size cannot be determined
   */
  getEstimatedDestinationSize() {
    this.#checkError(this.#module._charls_jpegls_encoder_get_estimated_destination_size(
      this.#encoder,
      this.#ui32Ptr
    ));
    return this.#module.getValue(this.#ui32Ptr, 'i32');
  }


  /**
   * Allocates and sets the destination buffer for encoded data.
   * @param {number} destinationSize - Size of the destination buffer to allocate
   * @throws {Error} If buffer allocation or setup fails
   */
  createDestinationBuffer(destinationSize) {
    if (this.#destinationBufferPtr === null) {
      this.#destinationBufferPtr = this.#malloc(destinationSize);
      this.#destinationBufferSize = destinationSize;
    }
    else if (destinationSize > this.#destinationBufferSize) {
      this.#module._free(this.#destinationBufferPtr);
      this.#destinationBufferPtr = this.#malloc(destinationSize);
      this.#destinationBufferSize = destinationSize;
    }

    this.#checkError(this.#module._charls_jpegls_encoder_set_destination_buffer(
      this.#encoder,
      this.#destinationBufferPtr,
      destinationSize
    ));
  }


  /**
   * Encodes image data from a source buffer. The destination buffer must be set up beforehand.
   * The returned Uint8Array is a view over the internal destination buffer, which remains valid until the next encode call or dispose.
   * @param {Buffer|Uint8Array} sourceBuffer - Image data to encode
   * @returns {Uint8Array} Encoded JPEG-LS data. This a view over the internal destination buffer.
   * @throws {Error} If encoding fails
   */
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
    const sourceBufferView = new Uint8Array(
      this.#module.HEAPU8.buffer,
      this.#sourceBufferPtr,
      sourceBuffer.length
    );

    // Copy source data into the allocated buffer
    sourceBufferView.set(sourceBuffer);

    this.#checkError(this.#module._charls_jpegls_encoder_encode_from_buffer(
      this.#encoder,
      this.#sourceBufferPtr,
      sourceBuffer.length,
      0
    ));

    // Create a Uint8Array view
    const bytesWritten = this.#getBytesWritten();
    this.#destinationBufferView = new Uint8Array(
      this.#module.HEAPU8.buffer,
      this.#destinationBufferPtr,
      bytesWritten
    );

    return this.#destinationBufferView;
  }


  /**
   * Gets the CharLS library version string.
   * @returns {string} Version string (e.g., "3.0.0")
   */
  getVersion() {
    return this.#module.UTF8ToString(this.#module._charls_get_version_string());
  }


  #getBytesWritten() {
    this.#checkError(this.#module._charls_jpegls_encoder_get_bytes_written(
      this.#encoder,
      this.#ui32Ptr));

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


export default JpegLSEncoder;

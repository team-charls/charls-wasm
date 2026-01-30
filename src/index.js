// SPDX-FileCopyrightText: © 2026 Team CharLS
// SPDX-License-Identifier: BSD-3-Clause

import createCharLSModule from './charlsjs.js'
import JpegLSDecoder from './jpegls-decoder.js'
import JpegLSEncoder from './jpegls-encoder.js'
import JpegLSError from './jpegls-error.js'

let charlsModuleInstance = null
let charlsModulePromise = null

/**
 * Initializes the CharLS WASM module.
 * This function is called automatically when creating a decoder or encoder,
 * but can be called explicitly to preload the module.
 * @returns {Promise<object>} The initialized WASM module
 */
async function initializeCharLSModule () {
  if (charlsModuleInstance) {
    return charlsModuleInstance
  }

  if (!charlsModulePromise) {
    charlsModulePromise = createCharLSModule()
  }

  charlsModuleInstance = await charlsModulePromise
  return charlsModuleInstance
}

/**
 * Creates a new JPEG-LS decoder instance.
 * Automatically initializes the WASM module if not already initialized.
 * @returns {Promise<JpegLSDecoder>} A new decoder instance
 * @throws {JpegLSError} If decoder creation fails
 */
async function createJpegLSDecoder () {
  const module = await initializeCharLSModule()
  return new JpegLSDecoder(module)
}

/**
 * Creates a new JPEG-LS encoder instance.
 * Automatically initializes the WASM module if not already initialized.
 * @returns {Promise<JpegLSEncoder>} A new encoder instance
 * @throws {JpegLSError} If encoder creation fails
 */
async function createJpegLSEncoder () {
  const module = await initializeCharLSModule()
  return new JpegLSEncoder(module)
}

export {
  createJpegLSDecoder,
  createJpegLSEncoder,
  initializeCharLSModule,
  JpegLSDecoder,
  JpegLSEncoder,
  JpegLSError
}

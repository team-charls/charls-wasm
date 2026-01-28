// SPDX-FileCopyrightText: © 2026 Team CharLS
// SPDX-License-Identifier: BSD-3-Clause

/**
 * Custom error class for JPEG-LS operations.
 * Extends the native Error class to provide additional context about errors
 * that occur during JPEG-LS encoding or decoding.
 */
class JpegLSError extends Error {
  constructor(message, code = -1) {
    super(message);
    this.name = 'JpegLSError';
    this.code = code;
  }
}

export default JpegLSError;
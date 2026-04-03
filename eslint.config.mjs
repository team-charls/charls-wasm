// SPDX-FileCopyrightText: © 2026 Team CharLS
// SPDX-License-Identifier: BSD-3-Clause

import pluginJs from '@eslint/js'
import globals from 'globals'
import markdown from '@eslint/markdown'

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest,
        fail: 'readonly'
      }
    },
    rules: {
      ...pluginJs.configs.recommended.rules
      // Add standard-like rules here if needed, or stick to recommended
    }
  },
  {
    files: ['**/*.md'],
    plugins: {
      markdown
    },
    language: 'markdown/commonmark',
    rules: {
      'markdown/no-invalid-label-refs': 'error'
    }
  }
]

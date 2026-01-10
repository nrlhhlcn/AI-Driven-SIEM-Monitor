// Test setup dosyası
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Her test sonrası temizlik
afterEach(() => {
  cleanup()
})

// Global test utilities
global.expect = expect

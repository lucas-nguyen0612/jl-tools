import { describe, it, expect } from 'vitest'
import { secondsToMMSS } from './utils'

describe('secondsToMMSS', () => {
  it('converts 0 seconds to 00:00', () => {
    expect(secondsToMMSS(0)).toBe('00:00')
  })

  it('converts 65 seconds to 01:05', () => {
    expect(secondsToMMSS(65)).toBe('01:05')
  })

  it('converts 1500 seconds (25min) to 25:00', () => {
    expect(secondsToMMSS(1500)).toBe('25:00')
  })

  it('converts 59 seconds to 00:59', () => {
    expect(secondsToMMSS(59)).toBe('00:59')
  })

  it('converts 119 seconds to 01:59', () => {
    expect(secondsToMMSS(119)).toBe('01:59')
  })

  it('converts 3661 seconds (61min) to 61:01', () => {
    expect(secondsToMMSS(3661)).toBe('61:01')
  })
})

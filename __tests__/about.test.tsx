import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { AboutSection } from '@/components/settings/AboutSection'

// next/link renders as a standard <a> in jsdom — no mock required.

// Set env vars before each test. The component reads process.env inside the
// function body, so values set here are picked up at render time.
const MOCK_VERSION = '0.1.0'
const MOCK_BUILD_DATE = '2026-04-28'

beforeEach(() => {
  process.env.NEXT_PUBLIC_APP_VERSION = MOCK_VERSION
  process.env.NEXT_PUBLIC_BUILD_DATE = MOCK_BUILD_DATE
})

afterEach(() => {
  delete process.env.NEXT_PUBLIC_APP_VERSION
  delete process.env.NEXT_PUBLIC_BUILD_DATE
})

describe('AboutSection', () => {
  it('renders the app name "JL Tools"', () => {
    const { getByText } = render(<AboutSection />)
    expect(getByText('JL Tools')).toBeInTheDocument()
  })

  it('displays the version string', () => {
    const { getByText } = render(<AboutSection />)
    expect(getByText(`v${MOCK_VERSION}`)).toBeInTheDocument()
  })

  it('displays the build date', () => {
    const { getByText } = render(<AboutSection />)
    expect(getByText(MOCK_BUILD_DATE)).toBeInTheDocument()
  })

  it('feedback link starts with mailto: and includes the version in the subject', () => {
    const { container } = render(<AboutSection />)
    const feedbackAnchor = container.querySelector('a[href^="mailto:"]') as HTMLAnchorElement
    expect(feedbackAnchor).not.toBeNull()
    expect(feedbackAnchor.getAttribute('href')).toContain('mailto:dat.t.nguyen.works@gmail.com')
    // Subject must include the version (decoded)
    const decoded = decodeURIComponent(feedbackAnchor.getAttribute('href') ?? '')
    expect(decoded).toContain(MOCK_VERSION)
  })

  it('feedback link text reads "Send feedback"', () => {
    const { getByText } = render(<AboutSection />)
    const link = getByText('Send feedback')
    expect(link.tagName.toLowerCase()).toBe('a')
    expect((link as HTMLAnchorElement).getAttribute('href')).toContain('mailto:')
  })

  it('Terms of Service link points to /legal/terms', () => {
    const { getByText } = render(<AboutSection />)
    const tos = getByText('Terms of Service') as HTMLAnchorElement
    expect(tos.tagName.toLowerCase()).toBe('a')
    expect(tos.getAttribute('href')).toBe('/legal/terms')
  })

  it('Privacy Policy link points to /legal/privacy', () => {
    const { getByText } = render(<AboutSection />)
    const privacy = getByText('Privacy Policy') as HTMLAnchorElement
    expect(privacy.tagName.toLowerCase()).toBe('a')
    expect(privacy.getAttribute('href')).toBe('/legal/privacy')
  })

  it('matches the snapshot', () => {
    const { container } = render(<AboutSection />)
    expect(container.firstChild).toMatchSnapshot()
  })
})

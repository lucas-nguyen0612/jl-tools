import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'

// Mock next/navigation BEFORE importing components that use it.
const usePathnameMock = vi.fn<() => string>()
vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

// next/link is fine in jsdom; no mock required.

import {
  SettingsSectionList,
  SETTINGS_SECTIONS,
} from '@/components/settings/SettingsSectionList'
import { SettingsNav, SETTINGS_NAV_ITEMS } from '@/components/settings/SettingsNav'
import { MobileBackLink } from '@/components/settings/MobileBackLink'
import { NAV_ITEMS as SIDE_NAV_ITEMS } from '@/components/layout/SideNav'
import { NAV_ITEMS as BOTTOM_NAV_ITEMS } from '@/components/layout/BottomNav'

describe('Settings shell', () => {
  beforeEach(() => {
    usePathnameMock.mockReset()
    usePathnameMock.mockReturnValue('/settings')
  })

  describe('SettingsSectionList', () => {
    it('exposes the 5 expected section hrefs in order', () => {
      const hrefs = SETTINGS_SECTIONS.map(s => s.href)
      expect(hrefs).toEqual([
        '/settings/profile',
        '/settings/account',
        '/settings/appearance',
        '/settings/notifications',
        '/settings/about',
      ])
    })

    it('renders 5 anchor links pointing at each section', () => {
      const { container } = render(<SettingsSectionList />)
      const anchors = container.querySelectorAll('a')
      expect(anchors).toHaveLength(5)
      const hrefs = Array.from(anchors).map(a => a.getAttribute('href'))
      expect(hrefs).toEqual([
        '/settings/profile',
        '/settings/account',
        '/settings/appearance',
        '/settings/notifications',
        '/settings/about',
      ])
    })

    it('renders each section title and description', () => {
      const { getByText } = render(<SettingsSectionList />)
      for (const section of SETTINGS_SECTIONS) {
        expect(getByText(section.title)).toBeInTheDocument()
        expect(getByText(section.description)).toBeInTheDocument()
      }
    })
  })

  describe('SettingsNav', () => {
    it('exposes the 5 expected nav hrefs in order', () => {
      const hrefs = SETTINGS_NAV_ITEMS.map(s => s.href)
      expect(hrefs).toEqual([
        '/settings/profile',
        '/settings/account',
        '/settings/appearance',
        '/settings/notifications',
        '/settings/about',
      ])
    })

    it('marks the active item with aria-current="page" and leaves others undecorated', () => {
      usePathnameMock.mockReturnValue('/settings/appearance')
      const { container } = render(<SettingsNav />)
      const anchors = container.querySelectorAll('a')
      const appearance = Array.from(anchors).find(
        a => a.getAttribute('href') === '/settings/appearance'
      ) as HTMLAnchorElement
      const profile = Array.from(anchors).find(
        a => a.getAttribute('href') === '/settings/profile'
      ) as HTMLAnchorElement
      expect(appearance.getAttribute('aria-current')).toBe('page')
      expect(profile.getAttribute('aria-current')).toBeNull()
    })

    it('treats nested subroutes as active (e.g. /settings/account/email matches /settings/account)', () => {
      usePathnameMock.mockReturnValue('/settings/account/email')
      const { container } = render(<SettingsNav />)
      const account = Array.from(container.querySelectorAll('a')).find(
        a => a.getAttribute('href') === '/settings/account'
      ) as HTMLAnchorElement
      expect(account.getAttribute('aria-current')).toBe('page')
    })

    it('does not falsely activate on prefix collisions (/settings/accounts must not match /settings/account)', () => {
      usePathnameMock.mockReturnValue('/settings/accounts')
      const { container } = render(<SettingsNav />)
      const account = Array.from(container.querySelectorAll('a')).find(
        a => a.getAttribute('href') === '/settings/account'
      ) as HTMLAnchorElement
      expect(account.getAttribute('aria-current')).toBeNull()
    })
  })

  describe('MobileBackLink', () => {
    it('renders an anchor pointing to /settings with the md:hidden class', () => {
      const { container } = render(<MobileBackLink />)
      const anchor = container.querySelector('a') as HTMLAnchorElement
      expect(anchor).not.toBeNull()
      expect(anchor.getAttribute('href')).toBe('/settings')
      expect(anchor.className).toContain('md:hidden')
    })
  })

  describe('Top-level navigation arrays', () => {
    it('SideNav.NAV_ITEMS contains a /settings entry', () => {
      const hrefs = SIDE_NAV_ITEMS.map(i => i.href)
      expect(hrefs).toContain('/settings')
    })

    it('SideNav.NAV_ITEMS places /settings after /character', () => {
      const hrefs = SIDE_NAV_ITEMS.map(i => i.href)
      const characterIdx = hrefs.indexOf('/character')
      const settingsIdx = hrefs.indexOf('/settings')
      expect(characterIdx).toBeGreaterThanOrEqual(0)
      expect(settingsIdx).toBe(characterIdx + 1)
    })

    it('BottomNav.NAV_ITEMS contains a /settings entry and has 6 items', () => {
      const hrefs = BOTTOM_NAV_ITEMS.map(i => i.href)
      expect(hrefs).toContain('/settings')
      expect(BOTTOM_NAV_ITEMS).toHaveLength(6)
    })

    it('BottomNav.NAV_ITEMS places /settings after /character', () => {
      const hrefs = BOTTOM_NAV_ITEMS.map(i => i.href)
      const characterIdx = hrefs.indexOf('/character')
      const settingsIdx = hrefs.indexOf('/settings')
      expect(characterIdx).toBeGreaterThanOrEqual(0)
      expect(settingsIdx).toBe(characterIdx + 1)
    })
  })
})

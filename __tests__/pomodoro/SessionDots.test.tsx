import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { SessionDots } from '@/components/pomodoro/SessionDots'

// SessionDots is a pure render component. We assert structural things:
// dot count, which dot is "current" vs "completed" via inline style hints,
// and the optional XP-earned label.

function getDots(container: HTMLElement): HTMLElement[] {
  // The component renders the "Today" label as a <span>, the optional XP
  // label as a <span>, and each dot as a sibling <div>. Filter the immediate
  // wrapper's children down to just the dot <div>s.
  const wrapper = container.firstChild as HTMLElement
  return Array.from(wrapper.children).filter(
    el => el.tagName === 'DIV'
  ) as HTMLElement[]
}

describe('SessionDots', () => {
  it('renders the default of 4 dots when total is omitted', () => {
    const { container } = render(<SessionDots sessionCount={0} />)
    expect(getDots(container)).toHaveLength(4)
  })

  it('renders N dots when total prop is provided', () => {
    const { container } = render(<SessionDots sessionCount={0} total={6} />)
    expect(getDots(container)).toHaveLength(6)
  })

  it('marks the first N dots as completed (accent-strong background)', () => {
    const { container } = render(<SessionDots sessionCount={2} total={4} />)
    const dots = getDots(container)
    expect(dots[0].style.background).toContain('accent-strong')
    expect(dots[1].style.background).toContain('accent-strong')
  })

  it('marks the current dot (index === sessionCount) with the accent-soft bg', () => {
    const { container } = render(<SessionDots sessionCount={2} total={4} />)
    const dots = getDots(container)
    expect(dots[2].style.background).toContain('accent-soft')
  })

  it('renders future (un-reached) dots with the sunken background', () => {
    const { container } = render(<SessionDots sessionCount={1} total={4} />)
    const dots = getDots(container)
    expect(dots[3].style.background).toContain('bg-sunken')
  })

  it('shows the +X XP earned label when xpEarned > 0', () => {
    const { getByText } = render(
      <SessionDots sessionCount={1} total={4} xpEarned={45} />
    )
    expect(getByText('+45 XP earned')).toBeInTheDocument()
  })

  it('hides the XP earned label when xpEarned is 0 or undefined', () => {
    const { container, queryByText } = render(
      <SessionDots sessionCount={1} total={4} xpEarned={0} />
    )
    expect(queryByText(/XP earned/)).toBeNull()

    const { container: c2, queryByText: q2 } = render(
      <SessionDots sessionCount={1} total={4} />
    )
    expect(q2(/XP earned/)).toBeNull()
    // sanity: still renders dots
    expect(getDots(c2)).toHaveLength(4)
    expect(getDots(container)).toHaveLength(4)
  })

  it('always shows the "Today" label', () => {
    const { getByText } = render(<SessionDots sessionCount={0} />)
    expect(getByText('Today')).toBeInTheDocument()
  })
})

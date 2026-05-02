'use client'

import { forwardRef, type ComponentProps } from 'react'
import FullCalendar from '@fullcalendar/react'

export const FullCalendarWithRef = forwardRef<
  FullCalendar,
  ComponentProps<typeof FullCalendar>
>(function FullCalendarWithRef(props, ref) {
  return <FullCalendar ref={ref} {...props} />
})

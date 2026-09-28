import { type ReactNode, forwardRef } from 'react'
import { type GetProps, type TamaguiElement, type View, withStaticProperties } from 'tamagui'
import type { HoverCardProps, HoverCardTriggerProps } from './types'

// iOS / Android: touch screens have no hover, and a press on the trigger
// already follows its link, so only the trigger renders (like Tooltip).

function HoverCardRoot({ children }: HoverCardProps) {
  return <>{children}</>
}

function HoverCardTrigger({ children }: HoverCardTriggerProps) {
  return children
}

export type HoverCardContentProps = GetProps<typeof View> & { children?: ReactNode }

const HoverCardContent = forwardRef<TamaguiElement, HoverCardContentProps>(
  function HoverCardContent() {
    return null
  },
)

export const HoverCard = withStaticProperties(HoverCardRoot, {
  Trigger: HoverCardTrigger,
  Content: HoverCardContent,
})

export type { HoverCardProps, HoverCardTriggerProps } from './types'

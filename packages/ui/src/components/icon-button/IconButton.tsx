import { type ReactElement, forwardRef } from 'react'
import type { TamaguiElement } from 'tamagui'
import { Button, type ButtonProps } from '../button/Button'

const squareSizes = {
  sm: '$8',
  md: '$10',
  lg: '$12',
} as const

export interface IconButtonProps extends Omit<
  ButtonProps,
  'size' | 'icon' | 'iconAfter' | 'children'
> {
  /** The icon element, e.g. `<SearchIcon />`. */
  icon: ReactElement
  /** Required: icon-only buttons need an accessible name. */
  'aria-label': string
  size?: keyof typeof squareSizes
  /** Fully round button. */
  circular?: boolean
}

/**
 * A square, icon-only button. `aria-label` is required so the action is
 * announced by screen readers.
 */
export const IconButton = forwardRef<TamaguiElement, IconButtonProps>(function IconButton(
  { icon, size = 'md', circular, variant = 'ghost', ...props },
  ref,
) {
  return (
    <Button
      ref={ref}
      variant={variant}
      size="icon"
      width={squareSizes[size]}
      height={squareSizes[size]}
      borderRadius={circular ? '$full' : undefined}
      icon={icon}
      {...props}
    />
  )
})

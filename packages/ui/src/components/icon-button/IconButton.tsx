import { type ReactElement, forwardRef, useContext } from 'react'
import type { TamaguiElement } from 'tamagui'
import { Button, type ButtonProps } from '../button/Button'
import { ButtonGroupContext } from '../button/groupContext'

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
  { icon, size: sizeProp, circular, variant: variantProp, ...props },
  ref,
) {
  // Inside a ButtonGroup, take its size and variant unless set here. Joined
  // to Buttons, it matches their default variant, as in a split button.
  const group = useContext(ButtonGroupContext)
  const size = sizeProp ?? group?.size ?? 'md'
  const variant = variantProp ?? group?.variant ?? (group?.attached ? 'default' : 'ghost')
  return (
    <Button
      ref={ref}
      variant={variant}
      size="icon"
      width={squareSizes[size]}
      height={squareSizes[size]}
      {...(circular && { borderRadius: '$full' })}
      icon={icon}
      {...props}
    />
  )
})

import { Children, type ReactNode, forwardRef, isValidElement } from 'react'
import { type GetProps, type TamaguiElement, View } from 'tamagui'
import type { ButtonVariant } from '../button/Button'
import {
  ButtonGroupContext,
  ButtonGroupItemContext,
  type ButtonGroupOrientation,
  type ButtonGroupSize,
  positionOf,
} from '../button/groupContext'

export interface ButtonGroupProps extends Omit<GetProps<typeof View>, 'children'> {
  /** Names the group for screen readers, e.g. "Text formatting". */
  'aria-label'?: string
  /** Join the buttons into one control. Default: true. */
  attached?: boolean
  orientation?: ButtonGroupOrientation
  /** Variant for buttons that do not set their own. */
  variant?: ButtonVariant
  /** Size for buttons and icon buttons that do not set their own. */
  size?: ButtonGroupSize
  /** Buttons and icon buttons. */
  children: ReactNode
}

/**
 * Groups related Buttons and IconButtons, joined into one control or spaced
 * apart, such as a split button or Previous · Today · Next.
 */
export const ButtonGroup = forwardRef<TamaguiElement, ButtonGroupProps>(function ButtonGroup(
  { attached = true, orientation = 'horizontal', variant, size, children, ...props },
  ref,
) {
  const items = Children.toArray(children).filter(isValidElement)
  const horizontal = orientation === 'horizontal'
  return (
    <ButtonGroupContext.Provider value={{ attached, orientation, variant, size }}>
      <View
        ref={ref}
        role="group"
        flexDirection={horizontal ? 'row' : 'column'}
        alignItems={horizontal ? 'center' : 'stretch'}
        alignSelf="flex-start"
        gap={attached ? 0 : '$2'}
        {...props}
      >
        {items.map((child, index) => (
          <ButtonGroupItemContext.Provider
            key={child.key ?? index}
            value={positionOf(index, items.length)}
          >
            {child}
          </ButtonGroupItemContext.Provider>
        ))}
      </View>
    </ButtonGroupContext.Provider>
  )
})

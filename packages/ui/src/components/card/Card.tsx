import { shadows } from '@advui/theme'
import { forwardRef } from 'react'
import {
  type GetProps,
  type TamaguiElement,
  type TamaguiTextElement,
  View,
  styled,
  withStaticProperties,
} from 'tamagui/unstyled'
import { useRipple } from '../../hooks/useRipple'
import { Text } from '../typography/Text'

const CardFrame = styled(View, {
  displayName: 'Card',
  flexDirection: 'column',
  backgroundColor: 'card',
  borderRadius: 'xl',
  borderWidth: 1,
  borderColor: 'border',
  overflow: 'hidden',
  variants: {
    variant: {
      outline: {},
      // The shadow is set by Card itself: a Tamagui 3 variant holds styles
      // only and drops Android's `elevation`.
      elevated: {},
      ghost: { borderColor: 'transparent', backgroundColor: 'transparent' },
      filled: {
        backgroundColor: 'muted',
        borderColor: 'transparent',
      },
    },
    /** Adds hover/press feedback. Pair with `onPress` and an accessible `role`/label. */
    interactive: {
      true: {
        cursor: 'pointer',
        transition: 'quick',
        borderColor: 'hover:borderStrong',
        scale: 'press:0.99',
        opacity: 'press:0.95',
        outlineColor: 'focus-visible:ring',
        outlineStyle: 'focus-visible:solid',
        outlineWidth: 'focus-visible:2px',
        outlineOffset: 'focus-visible:2px',
      },
    },
  } as const,
  defaultVariants: { variant: 'outline' },
})

const CardHeader = styled(View, {
  displayName: 'CardHeader',
  flexDirection: 'column',
  gap: '1-5',
  paddingTop: '4 sm:6',
  paddingRight: '4 sm:6',
  paddingLeft: '4 sm:6',
  paddingBottom: '0 sm:0',
})

const CardTitleText = styled(Text, {
  displayName: 'CardTitle',
  role: 'heading',
  fontFamily: 'heading',
  fontWeight: '600',
  size: 'lg',
})

/** Card heading. Defaults to heading level 3 — pass `aria-level` to fit your page outline. */
const CardTitle = forwardRef<TamaguiTextElement, GetProps<typeof CardTitleText>>(
  function CardTitle(props, ref) {
    return <CardTitleText ref={ref} aria-level={3} {...props} />
  },
)

const CardDescription = styled(Text, {
  displayName: 'CardDescription',
  size: 'sm',
  tone: 'muted',
})

const CardContent = styled(View, {
  displayName: 'CardContent',
  padding: '4 sm:6',
  gap: '4',
})

const CardFooter = styled(View, {
  displayName: 'CardFooter',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '2',
  paddingRight: '4 sm:6',
  paddingBottom: '4 sm:6',
  paddingLeft: '4 sm:6',
  paddingTop: '0 sm:0',
})

const CardImpl = forwardRef<TamaguiElement, GetProps<typeof CardFrame>>(function Card(
  { children, onPressIn, onPressOut, ...props },
  ref,
) {
  const ripple = useRipple({
    color: 'cardForeground',
    disabled: !props.interactive || !props.onPress,
    onPressIn,
    onPressOut,
  })
  return (
    <CardFrame
      ref={ref}
      {...(props.variant === 'elevated' && shadows.sm)}
      {...(ripple.active && {
        // The ripple is the press feedback, so the card does not also shrink.
        scale: 'press:1',
        opacity: 'press:1',
        // It is clipped inside the border: drop a transparent one.
        ...((props.variant === 'filled' || props.variant === 'ghost') && { borderWidth: 0 }),
      })}
      {...props}
      {...ripple.props}
    >
      {ripple.element}
      {children}
    </CardFrame>
  )
})

/**
 * Groups related content. Compose with `Card.Header`, `Card.Title`,
 * `Card.Description`, `Card.Content` and `Card.Footer`.
 */
export const Card = withStaticProperties(CardImpl, {
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
  Footer: CardFooter,
})

export type CardProps = GetProps<typeof CardFrame>
export type CardHeaderProps = GetProps<typeof CardHeader>
export type CardTitleProps = GetProps<typeof CardTitleText>
export type CardDescriptionProps = GetProps<typeof CardDescription>
export type CardContentProps = GetProps<typeof CardContent>
export type CardFooterProps = GetProps<typeof CardFooter>

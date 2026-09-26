import { shadows } from '@advui/theme'
import { forwardRef } from 'react'
import { type GetProps, type TamaguiTextElement, View, styled, withStaticProperties } from 'tamagui'
import { Text } from '../typography/Text'

const CardFrame = styled(View, {
  name: 'Card',
  flexDirection: 'column',
  backgroundColor: '$card',
  borderRadius: '$xl',
  borderWidth: 1,
  borderColor: '$border',
  overflow: 'hidden',

  variants: {
    variant: {
      outline: {},
      elevated: { ...shadows.sm },
      ghost: { borderColor: 'transparent', backgroundColor: 'transparent' },
      filled: { backgroundColor: '$muted', borderColor: 'transparent' },
    },
    /** Adds hover/press feedback. Pair with `onPress` and an accessible `role`/label. */
    interactive: {
      true: {
        cursor: 'pointer',
        transition: 'quick',
        hoverStyle: { borderColor: '$borderStrong' },
        pressStyle: { scale: 0.99, opacity: 0.95 },
        focusVisibleStyle: {
          outlineColor: '$ring',
          outlineStyle: 'solid',
          outlineWidth: 2,
          outlineOffset: 2,
        },
      },
    },
  } as const,

  defaultVariants: { variant: 'outline' },
})

const CardHeader = styled(View, {
  name: 'CardHeader',
  flexDirection: 'column',
  gap: '$1.5',
  padding: '$4',
  paddingBottom: '$0',
  $sm: { padding: '$6', paddingBottom: '$0' },
})

const CardTitleText = styled(Text, {
  name: 'CardTitle',
  role: 'heading',
  fontFamily: '$heading',
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
  name: 'CardDescription',
  size: 'sm',
  tone: 'muted',
})

const CardContent = styled(View, {
  name: 'CardContent',
  padding: '$4',
  gap: '$4',
  $sm: { padding: '$6' },
})

const CardFooter = styled(View, {
  name: 'CardFooter',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '$2',
  padding: '$4',
  paddingTop: '$0',
  $sm: { padding: '$6', paddingTop: '$0' },
})

/**
 * Groups related content. Compose with `Card.Header`, `Card.Title`,
 * `Card.Description`, `Card.Content` and `Card.Footer`.
 */
export const Card = withStaticProperties(CardFrame, {
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

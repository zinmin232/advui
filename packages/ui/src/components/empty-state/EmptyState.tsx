import { IconDefaults } from '@advui/icons'
import { type ReactNode, forwardRef } from 'react'
import { type GetProps, type TamaguiElement, View, XStack, styled } from 'tamagui'
import { Heading, type HeadingProps } from '../typography/Heading'
import { Text } from '../typography/Text'

const EmptyStateFrame = styled(View, {
  name: 'EmptyState',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$3',
  paddingVertical: '$10',
  paddingHorizontal: '$6',

  variants: {
    bordered: {
      true: {
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '$border',
        borderRadius: '$lg',
      },
    },
  } as const,
})

const tones = {
  default: { background: '$muted', icon: '$mutedForeground' },
  error: { background: '$errorSoft', icon: '$errorSoftForeground' },
} as const

export interface EmptyStateProps extends Omit<GetProps<typeof EmptyStateFrame>, 'children'> {
  /** Icon shown in a circle above the title. */
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  /** Heading level of the title (it is a heading on every platform). */
  headingLevel?: HeadingProps['level']
  /** Colors of the icon circle. Error State uses `error`. */
  tone?: keyof typeof tones
  /** Actions, usually one or two Buttons. */
  children?: ReactNode
}

/**
 * A placeholder for an empty list, search or page: an icon, a title, a short
 * explanation and the actions that fill it.
 */
export const EmptyState = forwardRef<TamaguiElement, EmptyStateProps>(function EmptyState(
  {
    icon,
    title,
    description,
    headingLevel = 3,
    tone = 'default',
    bordered = false,
    children,
    ...props
  },
  ref,
) {
  const colors = tones[tone]
  return (
    <EmptyStateFrame ref={ref} bordered={bordered} {...props}>
      {icon ? (
        <View
          aria-hidden
          backgroundColor={colors.background}
          borderRadius="$full"
          padding="$3"
          marginBottom="$1"
        >
          <IconDefaults size={24} color={colors.icon}>
            {icon}
          </IconDefaults>
        </View>
      ) : null}
      <Heading level={headingLevel} size="lg" textAlign="center">
        {title}
      </Heading>
      {description ? (
        <Text size="sm" tone="muted" textAlign="center" maxWidth={420}>
          {description}
        </Text>
      ) : null}
      {children ? (
        <XStack gap="$2" marginTop="$2" flexWrap="wrap" justifyContent="center">
          {children}
        </XStack>
      ) : null}
    </EmptyStateFrame>
  )
})

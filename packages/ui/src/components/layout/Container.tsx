import { breakpoints } from '@adv-ui/theme'
import { type GetProps, View, styled } from 'tamagui'

/**
 * Horizontally centered, width-capped page container with responsive padding.
 */
export const Container = styled(View, {
  name: 'Container',
  width: '100%',
  marginHorizontal: 'auto',
  paddingHorizontal: '$4',
  $md: { paddingHorizontal: '$6' },
  $lg: { paddingHorizontal: '$8' },

  variants: {
    size: {
      sm: { maxWidth: breakpoints.sm },
      md: { maxWidth: breakpoints.md },
      lg: { maxWidth: breakpoints.lg },
      xl: { maxWidth: breakpoints.xl },
      full: { maxWidth: '100%' },
    },
  } as const,

  defaultVariants: {
    size: 'xl',
  },
})

export type ContainerProps = GetProps<typeof Container>

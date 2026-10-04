import { breakpoints } from '@advui/theme'
import { type GetProps, type SpaceTokens, View, styled } from 'tamagui'
import { type Responsive, responsiveStyle } from '../../utils/responsive'

/** Side padding by default: 16px on phones, 24px from md and 32px from lg. */
const defaultGutter: Responsive<SpaceTokens> = { base: '$4', md: '$6', lg: '$8' }

/**
 * Horizontally centered, width-capped page container with responsive padding.
 */
export const Container = styled(View, {
  name: 'Container',
  width: '100%',
  marginHorizontal: 'auto',

  variants: {
    size: {
      sm: { maxWidth: breakpoints.sm },
      md: { maxWidth: breakpoints.md },
      lg: { maxWidth: breakpoints.lg },
      xl: { maxWidth: breakpoints.xl },
      xxl: { maxWidth: breakpoints.xxl },
      full: { maxWidth: '100%' },
    },
    /**
     * Side padding: a space token or a mobile-first map. The default lives here
     * rather than in base styles, so a gutter replaces it at every breakpoint
     * instead of competing with its media styles.
     */
    gutter: (value: Responsive<SpaceTokens>) =>
      responsiveStyle('paddingHorizontal', value ?? defaultGutter),
    /** Centers the children horizontally. */
    centerContent: {
      true: { alignItems: 'center' },
      false: {},
    },
  } as const,

  defaultVariants: {
    size: 'xl',
    gutter: defaultGutter,
  },
})

export type ContainerProps = GetProps<typeof Container>

import { type GetProps, View, styled } from 'tamagui'

/**
 * Placeholder shown while content loads. Hidden from assistive technology —
 * announce loading on the container instead (e.g. `aria-busy`).
 */
export const Skeleton = styled(View, {
  name: 'Skeleton',
  backgroundColor: '$muted',
  borderRadius: '$md',
  'aria-hidden': true,
  className: 'aui-skeleton',

  variants: {
    circle: {
      true: { borderRadius: '$full' },
    },
  } as const,
})

export type SkeletonProps = GetProps<typeof Skeleton>

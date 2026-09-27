import { forwardRef } from 'react'
import { type GetProps, type TamaguiElement, View, styled } from 'tamagui'

const AspectRatioFrame = styled(View, {
  name: 'AspectRatio',
  position: 'relative',
  width: '100%',
  overflow: 'hidden',
})

export interface AspectRatioProps extends Omit<GetProps<typeof AspectRatioFrame>, 'aspectRatio'> {
  /** Width divided by height, e.g. `16 / 9`. Default: 1 (a square). */
  ratio?: number
}

/**
 * Keeps its content at a fixed width-to-height ratio as the width changes,
 * for images, video and maps. Content should fill it (`width` and `height`
 * 100%, or absolute positioning).
 */
export const AspectRatio = forwardRef<TamaguiElement, AspectRatioProps>(function AspectRatio(
  { ratio = 1, ...props },
  ref,
) {
  return <AspectRatioFrame ref={ref} aspectRatio={ratio} {...props} />
})

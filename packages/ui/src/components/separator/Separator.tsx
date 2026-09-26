import { type GetProps, View, styled } from 'tamagui'

const SeparatorFrame = styled(View, {
  name: 'Separator',
  backgroundColor: '$border',
  flexShrink: 0,

  variants: {
    orientation: {
      horizontal: { height: 1, width: '100%' },
      vertical: { width: 1, alignSelf: 'stretch' },
    },
  } as const,

  defaultVariants: { orientation: 'horizontal' },
})

export type SeparatorProps = GetProps<typeof SeparatorFrame> & {
  /**
   * Purely visual separators are hidden from assistive technology (default).
   * Set `false` when the line separates meaningful sections.
   */
  decorative?: boolean
}

/** A thin line that visually (and optionally semantically) divides content. */
export function Separator({
  decorative = true,
  orientation = 'horizontal',
  ...props
}: SeparatorProps) {
  return (
    <SeparatorFrame
      orientation={orientation}
      {...(decorative
        ? { 'aria-hidden': true, role: 'none' as const }
        : { role: 'separator' as const, 'aria-orientation': orientation ?? 'horizontal' })}
      {...props}
    />
  )
}

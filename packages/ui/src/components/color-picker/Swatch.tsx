import { CheckIcon } from '@advui/icons'
import { mix, parseColor, readableForeground, toHex } from '@advui/utils'
import type { ReactNode } from 'react'
import { type RadiusTokens, type SizeTokens, View, isWeb } from 'tamagui/unstyled'
import { ariaState } from '../../utils/ariaState'
import { Checkerboard } from './Checkerboard'
import { WHITE, focusRing, rawColor } from './shared'

export interface SwatchProps {
  color: string
  size: SizeTokens
  radius?: RadiusTokens
  children?: ReactNode
}

/** A square of a color, over the transparency grid when it is translucent. */
export function Swatch({ color, size, radius = 'sm', children }: SwatchProps) {
  const translucent = (parseColor(color)?.a ?? 1) < 1
  return (
    <View
      position="relative"
      width={size}
      height={size}
      borderRadius={radius}
      overflow="hidden"
      borderWidth={1}
      borderColor="border"
      alignItems="center"
      justifyContent="center"
      pointerEvents="none"
      aria-hidden
    >
      {translucent ? <Checkerboard /> : null}
      <View position="absolute" inset={0} backgroundColor={rawColor(color)} />
      {children ? <View position="relative">{children}</View> : null}
    </View>
  )
}

/** The color a translucent swatch shows over the white grid, for the check mark's contrast. */
function shownOverWhite(color: string) {
  const rgba = parseColor(color)
  if (!rgba) return WHITE
  const opaque = toHex({ ...rgba, a: 1 })
  return rgba.a < 1 ? mix(WHITE, opaque, rgba.a) : opaque
}

export interface SwatchButtonProps {
  color: string
  label: string
  selected: boolean
  disabled: boolean
  onPress: () => void
}

/** A preset color. The chosen one has a check mark, so it does not rely on color. */
export function SwatchButton({ color, label, selected, disabled, onPress }: SwatchButtonProps) {
  return (
    <View
      {...(isWeb
        ? {
            render: 'button',
            type: 'button',
            padding: 0,
            borderWidth: 0,
            backgroundColor: 'transparent',
            'aria-pressed': selected,
          }
        : { accessible: true, role: 'button', 'aria-selected': ariaState(selected) })}
      borderRadius="sm"
      cursor={disabled ? 'not-allowed' : 'pointer'}
      {...focusRing}
      aria-label={label}
      aria-disabled={ariaState(disabled)}
      onPress={disabled ? undefined : onPress}
    >
      <Swatch color={color} size="6">
        {selected ? (
          <CheckIcon size={14} color={readableForeground(shownOverWhite(color))} />
        ) : null}
      </Swatch>
    </View>
  )
}

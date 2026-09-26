import { useIconColor } from '@adv-ui/icons'
import { ActivityIndicator } from 'react-native'
import { View } from 'tamagui'
import { spinnerSizes } from './sizes'
import type { SpinnerProps } from './Spinner'

/** Native: the platform ActivityIndicator, tinted with a theme color. */
export function Spinner({ size = 'md', color, label = 'Loading', ...props }: SpinnerProps) {
  const resolved = useIconColor(color ?? '$color')
  return (
    <View
      accessible
      role="progressbar"
      aria-label={label}
      aria-busy
      width={spinnerSizes[size]}
      height={spinnerSizes[size]}
      alignItems="center"
      justifyContent="center"
      {...props}
    >
      <ActivityIndicator size={size === 'lg' ? 'large' : 'small'} color={resolved} />
    </View>
  )
}

export type { SpinnerProps }

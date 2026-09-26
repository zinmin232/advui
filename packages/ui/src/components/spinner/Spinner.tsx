import { useIconColor } from '@adv-ui/icons'
import { View, type ViewProps } from 'tamagui'
import { spinnerSizes } from './sizes'

export interface SpinnerProps extends Omit<ViewProps, 'children'> {
  /** `sm` 16px · `md` 20px · `lg` 28px. */
  size?: 'sm' | 'md' | 'lg'
  /** Theme token or color. Defaults to the current text color. */
  color?: string
  /** Announced to assistive technology. Default: "Loading". */
  label?: string
}

/** Web: a lightweight CSS-animated SVG arc (keyframes live in GlobalStyles). */
export function Spinner({ size = 'md', color, label = 'Loading', ...props }: SpinnerProps) {
  const px = spinnerSizes[size]
  const stroke = useIconColor(color) ?? 'currentColor'
  return (
    <View role="progressbar" aria-label={label} aria-busy {...props}>
      <svg
        className="aui-spinner"
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        style={{ color: stroke, display: 'block' }}
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </View>
  )
}

import { useIconDefaults } from '@advui/icons'
import { type ReactNode, forwardRef } from 'react'
import { type TamaguiElement, View } from 'tamagui'
import { Button, type ButtonProps } from '../button/Button'
import { Spinner } from '../spinner'

export type SpinnerPosition = 'left' | 'right'

export interface LoadingButtonProps extends ButtonProps {
  /** Shows the spinner, sets `aria-busy` and blocks presses. The parent owns this state. */
  loading?: boolean
  /** Replaces the label while loading, e.g. "Saving…". Default: the label stays. */
  loadingText?: ReactNode
  /** Replaces the default spinner. Pass an element, not text. */
  spinner?: ReactNode
  /**
   * Where the spinner goes; it takes the place of the icon on that side.
   * Default: `left`, or `right` when the button has only `iconAfter`.
   */
  spinnerPosition?: SpinnerPosition
}

/** The Button's spinner in the label color, which Button provides to icons. */
function ButtonSpinner() {
  const { color } = useIconDefaults()
  // Decorative: the button reports busy itself. Without its own label and
  // role it cannot leak "Loading" into the button's name on native either.
  return <Spinner size="sm" color={color} accessible={false} role="none" aria-label={undefined} />
}

/**
 * A Button for asynchronous actions. While `loading` it shows a spinner,
 * optionally swaps the label for `loadingText`, and ignores presses, clicks
 * and keys, so an action cannot be submitted twice.
 *
 * @example
 * <LoadingButton loading={saving} loadingText="Saving…" onPress={save}>Save</LoadingButton>
 */
export const LoadingButton = forwardRef<TamaguiElement, LoadingButtonProps>(function LoadingButton(
  {
    loading = false,
    loadingText,
    spinner,
    spinnerPosition,
    disabled = false,
    icon,
    iconAfter,
    children,
    ...props
  },
  ref,
) {
  if (!loading) {
    return (
      <Button ref={ref} disabled={disabled} icon={icon} iconAfter={iconAfter} {...props}>
        {children}
      </Button>
    )
  }

  const position = spinnerPosition ?? (iconAfter != null && icon == null ? 'right' : 'left')
  // Hidden from assistive technology: the button itself reports busy, and a
  // named progressbar inside it would be read as part of its name.
  const indicator = <View aria-hidden>{spinner ?? <ButtonSpinner />}</View>

  return (
    <Button
      ref={ref}
      {...props}
      // Button's own `loading` always draws its spinner on the left, so the
      // state is set here: `disabled` blocks presses on every platform.
      disabled
      aria-busy
      icon={position === 'left' ? indicator : icon}
      iconAfter={position === 'right' ? indicator : iconAfter}
    >
      {loadingText ?? children}
    </Button>
  )
})

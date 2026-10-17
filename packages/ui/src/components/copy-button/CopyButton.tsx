import { CheckIcon, CopyIcon, XIcon } from '@advui/icons'
import { composeEventHandlers } from '@advui/utils'
import { type ReactNode, forwardRef, useContext, useState } from 'react'
import { AccessibilityInfo, type LayoutChangeEvent } from 'react-native'
import { type TamaguiElement, Text, View, isWeb } from 'tamagui'
import { visuallyHidden } from '../../utils/visuallyHidden'
import { Button, type ButtonProps } from '../button/Button'
import { ButtonGroupContext } from '../button/groupContext'
import { IconButton } from '../icon-button/IconButton'
import { Tooltip } from '../tooltip/Tooltip'
import { useClipboard } from './clipboard'

export interface CopyButtonLabels {
  /** Name of the icon-only button, and its tooltip. Default: "Copy". */
  copy: string
  /** Shown and announced after copying. Default: "Copied". */
  copied: string
  /** Shown and announced when copying fails. Default: "Couldn’t copy". */
  failed: string
}

const defaultLabels: CopyButtonLabels = {
  copy: 'Copy',
  copied: 'Copied',
  failed: 'Couldn’t copy',
}

export interface CopyButtonProps extends Omit<
  ButtonProps,
  'children' | 'icon' | 'iconAfter' | 'size' | 'loading' | 'onPress' | 'onCopy'
> {
  /** The text to copy. */
  value: string
  /** A visible label, e.g. "Copy link". Without one it is an icon button with a tooltip. */
  children?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  /** How long the copied (or failed) state shows, in ms. Default 2000. */
  timeout?: number
  /** Called with the text once it is on the clipboard. */
  onCopy?: (value: string) => void
  /** Called when the clipboard refuses the text, or there is none (see `setClipboard`). */
  onCopyError?: (error: unknown) => void
  /** Button name, tooltip and announcements, for translation. */
  labels?: Partial<CopyButtonLabels>
}

const icons = { idle: <CopyIcon />, copied: <CheckIcon />, failed: <XIcon /> }

/**
 * Copies a value to the clipboard and confirms it: the icon turns into a check
 * and screen readers hear "Copied". Without children it is an icon button.
 */
export const CopyButton = forwardRef<TamaguiElement, CopyButtonProps>(function CopyButton(
  {
    value,
    children,
    size,
    variant,
    timeout = 2000,
    onCopy,
    onCopyError,
    labels: labelsProp,
    onLayout,
    ...props
  },
  ref,
) {
  const labels = { ...defaultLabels, ...labelsProp }
  const group = useContext(ButtonGroupContext)
  const { copy, status } = useClipboard({ timeout, onCopy, onError: onCopyError })
  const [message, setMessage] = useState({ text: '', count: 0 })
  const [labelWidth, setLabelWidth] = useState<number>()
  const result = status === 'idle' ? null : labels[status]

  const onPress = async () => {
    const copied = await copy(value)
    const next = copied ? labels.copied : labels.failed
    if (isWeb) setMessage((current) => ({ text: next, count: current.count + 1 }))
    else AccessibilityInfo.announceForAccessibility(next)
  }

  // The icon button keeps its name while the result shows in the tooltip, so
  // the name still says what it does; the result is announced instead.
  const button =
    children == null ? (
      <Tooltip content={result ?? labels.copy}>
        <IconButton
          ref={ref}
          aria-label={labels.copy}
          size={size}
          variant={variant}
          icon={icons[status]}
          onPress={onPress}
          onLayout={onLayout}
          {...props}
        />
      </Tooltip>
    ) : (
      <Button
        ref={ref}
        size={size}
        // In a ButtonGroup, the group's variant.
        variant={variant ?? (group ? undefined : 'outline')}
        icon={icons[status]}
        onPress={onPress}
        onLayout={composeEventHandlers(onLayout, (event: LayoutChangeEvent) => {
          if (status === 'idle') setLabelWidth(event.nativeEvent.layout.width)
        })}
        // A shorter result ("Copied") keeps the label's width, so the buttons
        // beside it do not move (or wrap to another row) for two seconds.
        {...(result && labelWidth !== undefined && { minWidth: labelWidth })}
        {...props}
      >
        {result ?? children}
      </Button>
    )

  return (
    <>
      {button}
      {isWeb ? (
        <View role="status" aria-live="polite" {...visuallyHidden}>
          {message.text ? <Text key={message.count}>{message.text}</Text> : null}
        </View>
      ) : null}
    </>
  )
})

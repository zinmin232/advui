import { registerFocusable } from '@tamagui/focusable'
import { forwardRef, useEffect, useRef } from 'react'
import { TextInput, type TextInputProps } from 'react-native'
import { styled, useComposedRefs } from 'tamagui'
import { textBoxStyle } from './textBoxStyle'

type KeyHandler = (event: { key: string }) => void

interface KeyTextInputProps extends TextInputProps {
  id?: string
  disabled?: boolean
  onKey?: KeyHandler
}

// Tamagui drops `onKeyPress` from its styled components on native, its own
// Input included, so Backspace never reached Tags Input. This is React
// Native's TextInput with the handler under a name Tamagui passes on.
const KeyTextInput = forwardRef<TextInput, KeyTextInputProps>(function KeyTextInput(
  { id, disabled = false, onKey, ...props },
  ref,
) {
  const inputRef = useRef<TextInput>(null)
  const composedRef = useComposedRefs(ref, inputRef)
  // A Field's label focuses its control through Tamagui's registry, as Input's does.
  useEffect(() => {
    if (!id || disabled) return
    const focus = () => inputRef.current?.focus()
    return registerFocusable(id, { focus, focusAndSelect: focus })
  }, [id, disabled])
  return (
    <TextInput
      ref={composedRef}
      editable={!disabled}
      // Android wraps a long placeholder onto a cut-off second line.
      numberOfLines={1}
      // Read the key now: React Native reuses the event.
      onKeyPress={onKey && ((event) => onKey({ key: event.nativeEvent.key }))}
      {...props}
    />
  )
})

const Box = styled(KeyTextInput, textBoxStyle, {
  isInput: true,
  accept: { placeholderTextColor: 'color' },
})

/** Native: takes `onKeyDown` like the web box, as a styleable that keeps it. */
export const TagsInputText = Box.styleable<{ onKeyDown?: KeyHandler }>(
  ({ onKeyDown, ...props }, ref) => <Box ref={ref} {...props} onKey={onKeyDown} />,
)

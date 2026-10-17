import { Input as TamaguiInput, styled } from 'tamagui'
import { textBoxStyle } from './textBoxStyle'

/** Web: Tamagui's Input, an `<input>` that hears its own key presses. */
export const TagsInputText = styled(TamaguiInput, {
  ...textBoxStyle,
  unstyled: true,
  // The field draws the focus ring; `outline-style: auto` ignores width.
  focusStyle: { outlineWidth: 0, outlineStyle: 'none' },
  focusVisibleStyle: { outlineWidth: 0, outlineStyle: 'none' },
})

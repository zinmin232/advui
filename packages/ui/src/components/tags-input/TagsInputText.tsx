import { Input as TamaguiInput, styled } from 'tamagui'
import { textBoxStyle } from './textBoxStyle'

/** Web: Tamagui's Input, an `<input>` that hears its own key presses. */
export const TagsInputText = styled(TamaguiInput, {
  ...textBoxStyle,
  // The field draws the focus ring; `outline-style: auto` ignores width.
outlineWidth: "focus:0px focus-visible:0px",
  outlineStyle: "focus:none focus-visible:none",
  unstyled: true
})

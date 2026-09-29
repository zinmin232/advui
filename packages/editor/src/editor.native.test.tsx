import { describe, expect, it, jest } from '@jest/globals'
import { fireEvent, screen } from '@testing-library/react-native'
import { renderNative } from '../test/native-utils'
import { RichTextEditor } from './index'

// These run the React Native code path (react-native + Tamagui native builds,
// `.native.tsx` platform files): the same code Expo ships to iOS and Android.

describe('@advui/editor native rendering', () => {
  it('RichTextEditor formats the native selection from the toolbar', async () => {
    const onValueChange = jest.fn()
    await renderNative(
      <RichTextEditor
        aria-label="Report"
        defaultValue="clean water"
        onValueChange={onValueChange}
      />,
    )
    const field = screen.getByLabelText('Report')
    await fireEvent(field, 'selectionChange', { nativeEvent: { selection: { start: 6, end: 11 } } })
    await fireEvent.press(screen.getByRole('button', { name: 'Bold' }))
    expect(onValueChange).toHaveBeenLastCalledWith('clean **water**')
    await fireEvent.press(screen.getByRole('button', { name: 'Preview' }))
    expect(screen.getByText('water')).toBeOnTheScreen()
  })
})

import { describe, expect, it, jest } from '@jest/globals'
import { act, fireEvent, screen } from '@testing-library/react-native'
import type { View as NativeView } from 'react-native'
import { renderNative } from '../test/native-utils'
import { MarkdownEditor, RichTextEditor } from './index'

// These run the React Native code path (react-native + Tamagui native builds,
// `.native.tsx` platform files): the same code Expo ships to iOS and Android.

// TenTap runs TipTap in a WebView, which needs a device. Its bridge stands in
// here, so the tests check what the editor asks of it.
type MockOptions = { initialContent?: string; onChange?: () => void }
const mockOptions: { current: MockOptions } = { current: {} }
const mockState = {
  isReady: true,
  isFocused: false,
  selection: { from: 1, to: 1 },
  isBoldActive: true,
  isLinkActive: false,
  activeLink: undefined as string | undefined,
  headingLevel: undefined as number | undefined,
}
const mockEditor = {
  toggleBold: jest.fn(),
  toggleHeading: jest.fn(),
  setLink: jest.fn(),
  insertContent: jest.fn(),
  setContent: jest.fn(),
  setPlaceholder: jest.fn(),
  injectCSS: jest.fn(),
  injectJS: jest.fn(),
  focus: jest.fn(),
  getHTML: jest.fn(async () => '<p><strong>water</strong></p>'),
}

jest.mock('@10play/tentap-editor', () => {
  const { View } = jest.requireActual<{ View: typeof NativeView }>('react-native')
  const bridge = () => ({ configureExtension: bridge })
  return {
    ...Object.fromEntries(
      [
        'BlockquoteBridge',
        'BoldBridge',
        'BulletListBridge',
        'CodeBridge',
        'CoreBridge',
        'HardBreakBridge',
        'HeadingBridge',
        'HistoryBridge',
        'ItalicBridge',
        'LinkBridge',
        'ListItemBridge',
        'OrderedListBridge',
        'PlaceholderBridge',
        'StrikeBridge',
        'UnderlineBridge',
      ].map((name) => [name, bridge()]),
    ),
    RichText: () => <View testID="tentap-webview" />,
    useEditorBridge: (options: MockOptions) => {
      mockOptions.current = options
      return mockEditor
    },
    useBridgeState: () => mockState,
  }
})

describe('@advui/editor native rendering', () => {
  it('MarkdownEditor formats the native selection from the toolbar', async () => {
    const onValueChange = jest.fn()
    await renderNative(
      <MarkdownEditor
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

  it('RichTextEditor drives the WebView editor from its toolbar and names it', async () => {
    const onValueChange = jest.fn()
    await renderNative(
      <RichTextEditor
        aria-label="Report"
        defaultValue="<p>water</p>"
        onValueChange={onValueChange}
      />,
    )
    expect(screen.getByTestId('tentap-webview')).toBeOnTheScreen()
    expect(mockOptions.current.initialContent).toBe('<p>water</p>')
    // The page gets the theme and the name screen readers read.
    expect(mockEditor.injectCSS).toHaveBeenCalledWith(
      expect.stringContaining('.ProseMirror h2'),
      'advui-rich-text',
    )
    expect(mockEditor.injectJS).toHaveBeenCalledWith(
      expect.stringContaining('"aria-label":"Report"'),
    )

    const bold = screen.getByRole('togglebutton', { name: 'Bold' })
    expect(bold.props.accessibilityState).toMatchObject({ checked: true })
    expect(
      screen.getByRole('togglebutton', { name: 'Italic' }).props.accessibilityState,
    ).toMatchObject({ checked: false })
    await fireEvent.press(bold)
    expect(mockEditor.toggleBold).toHaveBeenCalled()
    await fireEvent.press(screen.getByRole('togglebutton', { name: 'Heading' }))
    expect(mockEditor.toggleHeading).toHaveBeenCalledWith(2)

    // With nothing selected, the address goes in as the link's text.
    await fireEvent.press(screen.getByRole('togglebutton', { name: 'Link' }))
    const address = screen.getByLabelText('Link address')
    await fireEvent.changeText(address, 'https://themimu.info')
    await fireEvent(address, 'submitEditing')
    expect(mockEditor.insertContent).toHaveBeenCalledWith(
      '<a href="https://themimu.info">https://themimu.info</a>',
    )
    expect(screen.queryByLabelText('Link address')).toBeNull()

    await act(async () => mockOptions.current.onChange?.())
    expect(onValueChange).toHaveBeenLastCalledWith('<p><strong>water</strong></p>')
  })
})

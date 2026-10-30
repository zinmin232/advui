import {
  BlockquoteBridge,
  BoldBridge,
  BulletListBridge,
  CodeBridge,
  CoreBridge,
  HardBreakBridge,
  HeadingBridge,
  HistoryBridge,
  ItalicBridge,
  LinkBridge,
  ListItemBridge,
  OrderedListBridge,
  PlaceholderBridge,
  RichText,
  StrikeBridge,
  UnderlineBridge,
  useBridgeState,
  useEditorBridge,
} from '@10play/tentap-editor'
import { useEffect, useRef, useState } from 'react'
import { View, useTheme } from 'tamagui/unstyled'
import { fieldBoxStyle, useControllableState, useFieldControl } from '@advui/core'
import { escapeHtml, normalizeHtml } from './html'
import {
  type ActiveTools,
  LinkBar,
  type RichTextEditorProps,
  type RichTextTool,
  RichTextToolbar,
  contentCss,
  defaultRichTextTools,
  resolveLabels,
  sizePx,
} from './parts'

type Bridge = ReturnType<typeof useEditorBridge>

const toggles: Record<Exclude<RichTextTool, 'link'>, (editor: Bridge) => void> = {
  bold: (editor) => editor.toggleBold(),
  italic: (editor) => editor.toggleItalic(),
  underline: (editor) => editor.toggleUnderline(),
  strikethrough: (editor) => editor.toggleStrike(),
  code: (editor) => editor.toggleCode(),
  heading: (editor) => editor.toggleHeading(2),
  bulletList: (editor) => editor.toggleBulletList(),
  orderedList: (editor) => editor.toggleOrderedList(),
  quote: (editor) => editor.toggleBlockquote(),
}

// Sets (or, for undefined, removes) attributes of the editable element.
const attributesScript = (attributes: Record<string, string | undefined>) =>
  `(function () {
  var el = document.querySelector('.ProseMirror');
  if (!el) return;
  var attributes = ${JSON.stringify(attributes)};
  Object.keys(attributes).forEach(function (name) {
    if (attributes[name] === undefined || attributes[name] === null) el.removeAttribute(name);
    else el.setAttribute(name, attributes[name]);
  });
})();
true;`

export function RichTextEditor(editorProps: RichTextEditorProps) {
  const {
    value: valueProp,
    defaultValue = '',
    onValueChange,
    placeholder,
    tools = defaultRichTextTools,
    minHeight = '32',
    disabled = false,
    invalid = false,
    'aria-label': ariaLabel,
    'aria-required': ariaRequired,
    accessibilityHint,
    labels: labelsProp,
  } = useFieldControl(editorProps)
  const labels = resolveLabels(labelsProp)
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })
  const [link, setLink] = useState<string | null>(null)
  // The link field takes focus from the WebView, and Android then collapses
  // the editor's selection, so the field keeps the one it opened with.
  const opened = useRef({ from: 0, to: 0, linked: false })
  const written = useRef(value)
  const latest = useRef(setValue)
  latest.current = setValue

  const editor = useEditorBridge({
    initialContent: value,
    editable: !disabled,
    // The WebView grows with the text, inside the screen's own scrolling.
    dynamicHeight: true,
    avoidIosKeyboard: true,
    bridgeExtensions: [
      CoreBridge,
      BoldBridge,
      ItalicBridge,
      UnderlineBridge,
      StrikeBridge,
      CodeBridge,
      LinkBridge.configureExtension({ openOnClick: false, autolink: true }),
      HeadingBridge,
      BulletListBridge,
      OrderedListBridge,
      ListItemBridge,
      BlockquoteBridge,
      HistoryBridge,
      HardBreakBridge,
      PlaceholderBridge.configureExtension({ placeholder: placeholder ?? '' }),
    ],
    theme: { webview: { backgroundColor: 'transparent' } },
    onChange: () => {
      void editor.getHTML().then((raw) => {
        const html = normalizeHtml(raw)
        if (html === written.current) return
        written.current = html
        latest.current(html)
      })
    },
  })
  const state = useBridgeState(editor)

  // The WebView is a page of its own: give it the theme's values, again on a theme change.
  const theme = useTheme()
  const color = (key: string) => (theme[key as keyof typeof theme] as { val?: string })?.val ?? ''
  const minPx = sizePx(minHeight)
  const css =
    contentCss(
      '.ProseMirror',
      {
        text: color('foreground'),
        muted: color('mutedForeground'),
        link: color('primaryText'),
        border: color('border'),
        code: color('muted'),
        placeholder: color('placeholder-color'),
      },
      // App fonts are not loaded in the WebView; the system's are its default.
      { body: 'system-ui, sans-serif', mono: 'monospace' },
    ) + (minPx === undefined ? '' : `.ProseMirror { min-height: ${minPx}px; }`)
  useEffect(() => {
    editor.injectCSS(css, 'advui-rich-text')
  }, [editor, css])

  // The name and state, for TalkBack and VoiceOver, are read from the page.
  useEffect(() => {
    if (!state.isReady) return
    editor.injectJS(
      attributesScript({
        'aria-label': ariaLabel,
        'aria-description': accessibilityHint,
        'aria-invalid': invalid ? 'true' : undefined,
        'aria-required': ariaRequired ? 'true' : undefined,
      }),
    )
  }, [editor, state.isReady, ariaLabel, accessibilityHint, invalid, ariaRequired])

  useEffect(() => {
    if (state.isReady) editor.setPlaceholder(placeholder ?? '')
  }, [editor, state.isReady, placeholder])

  // A new value from outside: load it, without calling onValueChange back.
  useEffect(() => {
    if (value === written.current) return
    written.current = value
    editor.setContent(value, { emitUpdate: false })
  }, [editor, value])

  const active: ActiveTools = {
    bold: state.isBoldActive,
    italic: state.isItalicActive,
    underline: state.isUnderlineActive,
    strikethrough: state.isStrikeActive,
    code: state.isCodeActive,
    link: state.isLinkActive || link !== null,
    heading: state.headingLevel !== undefined,
    bulletList: state.isBulletListActive,
    orderedList: state.isOrderedListActive,
    quote: state.isBlockquoteActive,
  }

  const closeLink = () => {
    setLink(null)
    editor.setSelection(opened.current.from, opened.current.to)
    editor.focus(null)
  }
  const openLink = () => {
    const { from, to } = state.selection
    opened.current = { from, to, linked: state.isLinkActive }
    setLink(state.activeLink ?? 'https://')
  }
  const applyLink = (href: string) => {
    setLink(null)
    const { from, to, linked } = opened.current
    editor.setSelection(from, to)
    // With nothing selected outside a link, the address is the text.
    if (from === to && !linked) {
      editor.insertContent(`<a href="${escapeHtml(href)}">${escapeHtml(href)}</a>`)
    } else editor.setLink(href)
    editor.focus(null)
  }
  const removeLink = () => {
    setLink(null)
    editor.setSelection(opened.current.from, opened.current.to)
    // TenTap unsets the link around the selection for '' and ignores null (a cancel).
    editor.setLink('')
    editor.focus(null)
  }

  return (
    <View
      {...fieldBoxStyle}
      {...(state.isFocused && { borderColor: 'ring' })}
      {...(invalid && { borderColor: 'error' })}
      opacity={disabled ? 0.5 : 1}
      overflow="hidden"
      width="100%"
    >
      <RichTextToolbar
        tools={tools}
        labels={labels}
        active={active}
        disabled={disabled}
        onTool={(tool) => {
          if (tool !== 'link') return toggles[tool](editor)
          if (link === null) openLink()
          else closeLink()
        }}
      />
      {link !== null ? (
        <LinkBar
          labels={labels}
          initial={link}
          linked={opened.current.linked}
          onApply={applyLink}
          onRemove={removeLink}
          onCancel={closeLink}
        />
      ) : null}
      <View minHeight={minHeight}>
        <RichText editor={editor} />
      </View>
    </View>
  )
}

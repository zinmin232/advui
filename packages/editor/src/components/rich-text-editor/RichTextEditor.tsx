import { ListItem } from '@tiptap/extension-list'
import { Placeholder } from '@tiptap/extensions'
import { type Editor, EditorContent, Extension, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useContext, useEffect, useId, useMemo, useRef, useState } from 'react'
import { View, getConfig } from 'tamagui/unstyled'
import { FieldContext, fieldBoxStyle, useControllableState, useFieldControl } from '@advui/core'
import { normalizeHtml } from './html'
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

// Tab leaves the text instead of nesting list items, so the keyboard can
// always move on, and lists stay one level deep, as Rich Text Content draws them.
const FlatListItem = ListItem.extend({
  addKeyboardShortcuts() {
    return { Enter: () => this.editor.commands.splitListItem(this.name) }
  },
})

const toggles: Record<Exclude<RichTextTool, 'link'>, (editor: Editor) => void> = {
  bold: (editor) => editor.chain().focus().toggleBold().run(),
  italic: (editor) => editor.chain().focus().toggleItalic().run(),
  underline: (editor) => editor.chain().focus().toggleUnderline().run(),
  strikethrough: (editor) => editor.chain().focus().toggleStrike().run(),
  code: (editor) => editor.chain().focus().toggleCode().run(),
  heading: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  bulletList: (editor) => editor.chain().focus().toggleBulletList().run(),
  orderedList: (editor) => editor.chain().focus().toggleOrderedList().run(),
  quote: (editor) => editor.chain().focus().toggleBlockquote().run(),
}

const activeTools = (editor: Editor): ActiveTools => ({
  bold: editor.isActive('bold'),
  italic: editor.isActive('italic'),
  underline: editor.isActive('underline'),
  strikethrough: editor.isActive('strike'),
  code: editor.isActive('code'),
  link: editor.isActive('link'),
  heading: editor.isActive('heading'),
  bulletList: editor.isActive('bulletList'),
  orderedList: editor.isActive('orderedList'),
  quote: editor.isActive('blockquote'),
})

const fieldFocusStyle = {
  borderColor: 'ring',
  outlineColor: 'ring',
  outlineStyle: 'solid',
  outlineWidth: '2px',
} as const

/** The theme as CSS variables, so the text follows a theme change without a render. */
function editorCss() {
  const fonts = getConfig().fonts as Record<string, { family?: string } | undefined>
  return contentCss(
    '.aui-rich-text',
    {
      text: 'var(--foreground)',
      muted: 'var(--mutedForeground)',
      link: 'var(--primaryText)',
      border: 'var(--border)',
      code: 'var(--muted)',
      placeholder: 'var(--placeholder-color)',
    },
    { body: fonts.body?.family ?? 'sans-serif', mono: fonts.mono?.family ?? 'monospace' },
  )
}

/**
 * A WYSIWYG editor: the text shows bold, headings, lists and links as it is
 * written. It saves HTML, which Rich Text Content shows on every platform.
 * Web edits in the page with TipTap; iOS and Android run TipTap in a WebView
 * (TenTap), with the same toolbar.
 */
export function RichTextEditor(editorProps: RichTextEditorProps) {
  const field = useContext(FieldContext)
  const {
    value: valueProp,
    defaultValue = '',
    onValueChange,
    placeholder,
    tools = defaultRichTextTools,
    minHeight = '32',
    disabled = false,
    invalid = false,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    'aria-required': ariaRequired,
    labels: labelsProp,
  } = useFieldControl(editorProps)
  const labels = resolveLabels(labelsProp)
  const css = useMemo(editorCss, [])
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })
  // The address the link field opens with, or null while it is closed.
  const [link, setLink] = useState<string | null>(null)
  const generatedId = useId()
  const textId = id ?? `${generatedId}-text`
  // The HTML the editor wrote last, so it is not loaded back into the editor.
  const written = useRef(value)
  const latest = useRef({ setValue, placeholder, openLink: () => {} })

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        codeBlock: false,
        horizontalRule: false,
        listItem: false,
        trailingNode: false,
        heading: { levels: [1, 2, 3] },
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
      }),
      FlatListItem,
      Placeholder.configure({ placeholder: () => latest.current.placeholder ?? '' }),
      Extension.create({
        name: 'advuiLinkShortcut',
        addKeyboardShortcuts: () => ({
          'Mod-k': () => {
            latest.current.openLink()
            return true
          },
        }),
      }),
    ],
    [],
  )

  // A `<label for>` cannot name a div, so a Field's label names it by id.
  const labelledBy = ariaLabel ? undefined : (ariaLabelledBy ?? field?.labelId)
  const minPx = sizePx(minHeight)
  const attributes = useMemo(
    () =>
      Object.fromEntries(
        Object.entries({
          id: textId,
          role: 'textbox',
          'aria-multiline': 'true',
          'aria-label': ariaLabel,
          'aria-labelledby': labelledBy,
          'aria-describedby': ariaDescribedBy,
          'aria-invalid': invalid ? 'true' : undefined,
          'aria-required': ariaRequired ? 'true' : undefined,
          'aria-disabled': disabled ? 'true' : undefined,
          'aria-placeholder': placeholder,
          class: 'aui-rich-text',
          style: minPx === undefined ? undefined : `min-height: ${minPx}px`,
        }).filter((entry): entry is [string, string] => entry[1] !== undefined),
      ),
    [
      textId,
      ariaLabel,
      labelledBy,
      ariaDescribedBy,
      invalid,
      ariaRequired,
      disabled,
      placeholder,
      minPx,
    ],
  )
  const editorOptions = useMemo(() => ({ attributes }), [attributes])

  const editor = useEditor({
    // The server and the first render show the frame; TipTap fills it after.
    immediatelyRender: false,
    extensions,
    content: written.current,
    editable: !disabled,
    editorProps: editorOptions,
    onUpdate: ({ editor: current }) => {
      const html = normalizeHtml(current.getHTML())
      if (html === written.current) return
      written.current = html
      latest.current.setValue(html)
    },
  })

  const active: ActiveTools & { focused?: boolean } =
    useEditorState({
      editor,
      selector: ({ editor: current }) =>
        current ? { ...activeTools(current), focused: current.isFocused } : {},
    }) ?? {}

  const openLink = () => {
    if (!editor || disabled) return
    setLink((editor.getAttributes('link').href as string | undefined) ?? 'https://')
  }
  latest.current = { setValue, placeholder, openLink }

  // A new value from outside: load it, without calling onValueChange back.
  useEffect(() => {
    if (!editor || value === written.current) return
    written.current = value
    editor.commands.setContent(value, { emitUpdate: false })
  }, [editor, value])

  useEffect(() => {
    if (editor && editor.isEditable === disabled) editor.setEditable(!disabled, false)
  }, [editor, disabled])

  const closeLink = () => {
    setLink(null)
    editor?.commands.focus()
  }
  const applyLink = (href: string) => {
    setLink(null)
    if (!editor) return
    const chain = editor.chain().focus()
    // With nothing selected outside a link, the address is the text.
    if (editor.state.selection.empty && !editor.isActive('link')) {
      chain.insertContent({ type: 'text', text: href, marks: [{ type: 'link', attrs: { href } }] })
    } else chain.extendMarkRange('link').setLink({ href })
    chain.run()
  }

  return (
    <View
      {...fieldBoxStyle}
      // The text is focused, not the frame: draw the field's focus ring for it.
      {...(active.focused && fieldFocusStyle)}
      {...(invalid && { borderColor: 'error' })}
      opacity={disabled ? 0.5 : 1}
      overflow="hidden"
      width="100%"
    >
      <style href="advui-rich-text" precedence="default">
        {css}
      </style>
      <RichTextToolbar
        tools={tools}
        labels={labels}
        active={{ ...active, link: active.link || link !== null }}
        disabled={disabled}
        // The text exists once TipTap has mounted, after the first render.
        controls={editor ? textId : undefined}
        onTool={(tool) => {
          if (!editor) return
          if (tool === 'link') {
            if (link === null) openLink()
            else closeLink()
          } else toggles[tool](editor)
        }}
      />
      {link !== null ? (
        <LinkBar
          labels={labels}
          initial={link}
          linked={!!active.link}
          onApply={applyLink}
          onRemove={() => {
            setLink(null)
            editor?.chain().focus().extendMarkRange('link').unsetLink().run()
          }}
          onCancel={closeLink}
        />
      ) : null}
      <View minHeight={minHeight}>
        <EditorContent editor={editor} />
      </View>
    </View>
  )
}

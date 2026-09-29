import {
  BoldIcon,
  CodeIcon,
  HeadingIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  StrikethroughIcon,
} from '@advui/icons'
import { type ReactElement, useId, useLayoutEffect, useRef, useState } from 'react'
import { type GetProps, type TamaguiElement, View, XStack, isWeb } from 'tamagui'
import {
  Button,
  IconButton,
  Text,
  Textarea,
  fieldBoxStyle,
  useControllableState,
} from '@advui/core'
import { RichTextContent } from './RichTextContent'
import { type RichTextTool, type TextSelection, applyFormat, shortcuts } from './markdown'

export interface RichTextEditorLabels {
  toolbar: string
  tools: Record<RichTextTool, string>
  preview: string
  /** Shown in the preview when there is nothing to show. */
  empty: string
  /** Character count with `maxLength`: "120 of 500 characters". */
  count: (length: number, max: number) => string
}

const defaultLabels: RichTextEditorLabels = {
  toolbar: 'Formatting',
  tools: {
    bold: 'Bold',
    italic: 'Italic',
    strikethrough: 'Strikethrough',
    code: 'Code',
    link: 'Link',
    heading: 'Heading',
    bulletList: 'Bulleted list',
    orderedList: 'Numbered list',
    quote: 'Quote',
  },
  preview: 'Preview',
  empty: 'Nothing to preview.',
  count: (length, max) => `${length} of ${max} characters`,
}

const icons: Record<RichTextTool, ReactElement> = {
  bold: <BoldIcon />,
  italic: <ItalicIcon />,
  strikethrough: <StrikethroughIcon />,
  code: <CodeIcon />,
  link: <LinkIcon />,
  heading: <HeadingIcon />,
  bulletList: <ListIcon />,
  orderedList: <ListOrderedIcon />,
  quote: <QuoteIcon />,
}

const shortcutHints: Partial<Record<RichTextTool, string>> = { bold: 'B', italic: 'I', link: 'K' }

export const defaultRichTextTools: RichTextTool[] = [
  'bold',
  'italic',
  'strikethrough',
  'heading',
  'bulletList',
  'orderedList',
  'quote',
  'link',
  'code',
]

export interface RichTextEditorProps {
  /** Markdown (controlled). */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  /** Toolbar buttons, in order. Default: all nine. */
  tools?: RichTextTool[]
  /** Minimum height of the text area. Default: `$32`. */
  minHeight?: GetProps<typeof View>['minHeight']
  maxLength?: number
  disabled?: boolean
  invalid?: boolean
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-required'?: boolean
  /** Native: help read after the name (Form Field sets it). */
  accessibilityHint?: string
  /** Toolbar, tool and preview names, for translation. */
  labels?: Partial<Omit<RichTextEditorLabels, 'tools'>> & {
    tools?: Partial<RichTextEditorLabels['tools']>
  }
}

type Editable = TamaguiElement & {
  selectionStart?: number
  selectionEnd?: number
  setSelectionRange?: (start: number, end: number) => void
  setSelection?: (start: number, end: number) => void
  focus?: () => void
}

/**
 * A Markdown editor with a formatting toolbar and a preview. It stores plain
 * Markdown, so the text is safe to save and shows the same on every platform
 * with Rich Text Content.
 */
export function RichTextEditor({
  value: valueProp,
  defaultValue = '',
  onValueChange,
  placeholder,
  tools = defaultRichTextTools,
  minHeight = '$32',
  maxLength,
  disabled = false,
  invalid = false,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-required': ariaRequired,
  accessibilityHint,
  labels: labelsProp,
}: RichTextEditorProps) {
  const labels = {
    ...defaultLabels,
    ...labelsProp,
    tools: { ...defaultLabels.tools, ...labelsProp?.tools },
  }
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })
  const [preview, setPreview] = useState(false)
  const [activeTool, setActiveTool] = useState(0)
  const field = useRef<Editable | null>(null)
  // Native reports the caret as it moves; web reads it from the textarea.
  const selection = useRef<TextSelection>({ start: value.length, end: value.length })
  const pending = useRef<TextSelection | null>(null)
  const generatedId = useId()
  const fieldId = id ?? `${generatedId}-field`
  const countId = `${generatedId}-count`

  // Put the selection where the tool left it, once the new text is in.
  useLayoutEffect(() => {
    const next = pending.current
    const node = field.current
    if (!next || !node) return
    pending.current = null
    node.focus?.()
    if (node.setSelectionRange) node.setSelectionRange(next.start, next.end)
    else node.setSelection?.(next.start, next.end)
    selection.current = next
  })

  const apply = (tool: RichTextTool) => {
    const node = field.current
    const current =
      isWeb && node?.selectionStart != null
        ? { start: node.selectionStart, end: node.selectionEnd ?? node.selectionStart }
        : selection.current
    const result = applyFormat(value, current, tool)
    if (maxLength != null && result.value.length > maxLength) return
    pending.current = result.selection
    setValue(result.value)
  }

  const onFieldKeyDown = (event: {
    key: string
    metaKey?: boolean
    ctrlKey?: boolean
    shiftKey?: boolean
    altKey?: boolean
    preventDefault: () => void
  }) => {
    if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) return
    const tool = shortcuts[event.key.toLowerCase()]
    if (tool && tools.includes(tool)) {
      event.preventDefault()
      apply(tool)
    }
  }

  // One tab stop for the toolbar; the arrow keys move along it (WAI-ARIA toolbar).
  const onToolbarKeyDown = (event: { key: string; preventDefault: () => void }) => {
    const last = tools.length - 1
    const moves: Record<string, number> = {
      ArrowRight: activeTool >= last ? 0 : activeTool + 1,
      ArrowLeft: activeTool <= 0 ? last : activeTool - 1,
      Home: 0,
      End: last,
    }
    if (!(event.key in moves)) return
    event.preventDefault()
    const next = moves[event.key]!
    setActiveTool(next)
    document.getElementById(`${generatedId}-tool-${next}`)?.focus()
  }

  const toolsDisabled = disabled || preview

  return (
    <View
      {...fieldBoxStyle}
      {...(invalid && { borderColor: '$error' })}
      opacity={disabled ? 0.5 : 1}
      overflow="hidden"
      width="100%"
    >
      <XStack
        alignItems="center"
        justifyContent="space-between"
        gap="$2"
        padding="$1"
        borderBottomWidth={1}
        borderColor="$border"
      >
        <XStack
          flexWrap="wrap"
          flex={1}
          {...(isWeb && {
            role: 'toolbar',
            'aria-label': labels.toolbar,
            'aria-controls': fieldId,
            onKeyDown: onToolbarKeyDown,
          })}
        >
          {tools.map((tool, i) => (
            <IconButton
              key={tool}
              id={`${generatedId}-tool-${i}`}
              size="sm"
              icon={icons[tool]}
              aria-label={labels.tools[tool]}
              {...(isWeb && {
                tabIndex: i === activeTool ? 0 : -1,
                title: shortcutHints[tool]
                  ? `${labels.tools[tool]} (Ctrl+${shortcutHints[tool]})`
                  : labels.tools[tool],
                // Keep the text selected while pressing a tool.
                onMouseDown: (event: { preventDefault: () => void }) => event.preventDefault(),
                onFocus: () => setActiveTool(i),
              })}
              disabled={toolsDisabled}
              onPress={() => apply(tool)}
            />
          ))}
        </XStack>
        <Button
          size="sm"
          variant="ghost"
          aria-pressed={preview}
          disabled={disabled}
          onPress={() => setPreview(!preview)}
          {...(preview && { backgroundColor: '$accent' })}
        >
          {labels.preview}
        </Button>
      </XStack>
      {preview ? (
        <View
          minHeight={minHeight}
          padding="$3"
          {...(isWeb && { role: 'region', 'aria-label': labels.preview })}
        >
          {value.trim() ? (
            <RichTextContent>{value}</RichTextContent>
          ) : (
            <Text size="sm" tone="muted">
              {labels.empty}
            </Text>
          )}
        </View>
      ) : (
        <Textarea
          ref={field as never}
          id={fieldId}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          disabled={disabled}
          invalid={invalid}
          maxLength={maxLength}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-required={ariaRequired}
          {...(accessibilityHint && { accessibilityHint })}
          aria-describedby={
            [ariaDescribedBy, maxLength != null ? countId : null].filter(Boolean).join(' ') ||
            undefined
          }
          minHeight={minHeight}
          // The frame draws the border; the text area sits flush inside it.
          borderWidth={0}
          borderRadius={0}
          backgroundColor="transparent"
          focusVisibleStyle={{ outlineWidth: 0, outlineStyle: 'none' }}
          onSelectionChange={(event: { nativeEvent: { selection: TextSelection } }) => {
            selection.current = event.nativeEvent.selection
          }}
          {...(isWeb && { onKeyDown: onFieldKeyDown })}
        />
      )}
      {maxLength != null ? (
        <Text
          id={countId}
          size="xs"
          tone="muted"
          textAlign="right"
          paddingHorizontal="$3"
          paddingBottom="$2"
        >
          {labels.count(value.length, maxLength)}
        </Text>
      ) : null}
    </View>
  )
}

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
  UnderlineIcon,
} from '@advui/icons'
import { type ReactElement, useState } from 'react'
import { type GetProps, type View, XStack, getConfig, getTokenValue, isWeb } from 'tamagui/unstyled'
import { Button, FieldContext, Input, Toggle, Toolbar } from '@advui/core'

export type RichTextTool =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'code'
  | 'link'
  | 'heading'
  | 'bulletList'
  | 'orderedList'
  | 'quote'

export interface RichTextEditorLabels {
  toolbar: string
  tools: Record<RichTextTool, string>
  /** The link field's name. */
  linkAddress: string
  applyLink: string
  removeLink: string
  cancel: string
}

const defaultLabels: RichTextEditorLabels = {
  toolbar: 'Formatting',
  tools: {
    bold: 'Bold',
    italic: 'Italic',
    underline: 'Underline',
    strikethrough: 'Strikethrough',
    code: 'Code',
    link: 'Link',
    heading: 'Heading',
    bulletList: 'Bulleted list',
    orderedList: 'Numbered list',
    quote: 'Quote',
  },
  linkAddress: 'Link address',
  applyLink: 'Apply',
  removeLink: 'Remove link',
  cancel: 'Cancel',
}

export const defaultRichTextTools: RichTextTool[] = [
  'bold',
  'italic',
  'underline',
  'strikethrough',
  'heading',
  'bulletList',
  'orderedList',
  'quote',
  'link',
  'code',
]

export interface RichTextEditorProps {
  /** HTML (controlled). An empty document is `''`. */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  /** Toolbar buttons, in order. Default: all ten. */
  tools?: RichTextTool[]
  /** Minimum height of the text. Default: `32`. */
  minHeight?: GetProps<typeof View>['minHeight']
  disabled?: boolean
  invalid?: boolean
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-required'?: boolean
  /** Native: help read after the name (a Field sets it). */
  accessibilityHint?: string
  /** Toolbar, tool and link field names, for translation. */
  labels?: Partial<Omit<RichTextEditorLabels, 'tools'>> & {
    tools?: Partial<RichTextEditorLabels['tools']>
  }
}

export function resolveLabels(labels: RichTextEditorProps['labels']): RichTextEditorLabels {
  return { ...defaultLabels, ...labels, tools: { ...defaultLabels.tools, ...labels?.tools } }
}

/** Which tools the selection has, so the toolbar shows them pressed. */
export type ActiveTools = Partial<Record<RichTextTool, boolean>>

const icons: Record<RichTextTool, ReactElement> = {
  bold: <BoldIcon />,
  italic: <ItalicIcon />,
  underline: <UnderlineIcon />,
  strikethrough: <StrikethroughIcon />,
  code: <CodeIcon />,
  link: <LinkIcon />,
  heading: <HeadingIcon />,
  bulletList: <ListIcon />,
  orderedList: <ListOrderedIcon />,
  quote: <QuoteIcon />,
}

// TipTap's shortcuts, plus Mod-K for links (web).
const shortcuts: Record<RichTextTool, string> = {
  bold: 'B',
  italic: 'I',
  underline: 'U',
  strikethrough: 'Shift+S',
  code: 'E',
  link: 'K',
  heading: 'Alt+2',
  bulletList: 'Shift+8',
  orderedList: 'Shift+7',
  quote: 'Shift+B',
}

export function RichTextToolbar({
  tools,
  labels,
  active,
  disabled,
  controls,
  onTool,
}: {
  tools: RichTextTool[]
  labels: RichTextEditorLabels
  active: ActiveTools
  disabled: boolean
  /** The text's id. */
  controls?: string
  onTool: (tool: RichTextTool) => void
}) {
  return (
    <Toolbar
      variant="ghost"
      size="sm"
      wrap
      gap="0-5"
      padding="1"
      borderRadius={0}
      borderBottomWidth={1}
      borderColor="border"
      // A named frame on native catches touches meant for its buttons.
      {...(isWeb && { role: 'toolbar', 'aria-label': labels.toolbar, 'aria-controls': controls })}
    >
      {tools.map((tool) => (
        <Toggle
          key={tool}
          size="sm"
          icon={icons[tool]}
          aria-label={labels.tools[tool]}
          pressed={!!active[tool]}
          disabled={disabled}
          {...(isWeb && {
            title: `${labels.tools[tool]} (Ctrl+${shortcuts[tool]})`,
            'aria-keyshortcuts': `Control+${shortcuts[tool]} Meta+${shortcuts[tool]}`,
          })}
          onPress={() => onTool(tool)}
        />
      ))}
    </Toolbar>
  )
}

/** The address field Link opens under the toolbar. */
export function LinkBar({
  labels,
  initial,
  linked,
  onApply,
  onRemove,
  onCancel,
}: {
  labels: RichTextEditorLabels
  initial: string
  /** The selection is in a link already. */
  linked: boolean
  onApply: (href: string) => void
  onRemove: () => void
  onCancel: () => void
}) {
  const [href, setHref] = useState(initial)
  const apply = () => {
    const url = href.trim()
    if (url && url !== 'https://') onApply(url)
    else onCancel()
  }
  return (
    // The field is not the editor's: keep a surrounding Field's id and label off it.
    <FieldContext.Provider value={null}>
      <XStack
        flexWrap="wrap"
        alignItems="center"
        gap="2"
        padding="2"
        borderBottomWidth={1}
        borderColor="border"
      >
        <Input
          size="sm"
          flex={1}
          minWidth="40"
          autoFocus
          value={href}
          onChangeText={setHref}
          aria-label={labels.linkAddress}
          inputMode="url"
          autoCapitalize="none"
          autoCorrect={false}
          {...(isWeb
            ? {
                onKeyDown: (event: { key: string; preventDefault: () => void }) => {
                  if (event.key !== 'Enter' && event.key !== 'Escape') return
                  event.preventDefault()
                  if (event.key === 'Enter') apply()
                  else onCancel()
                },
              }
            : { keyboardType: 'url', returnKeyType: 'done', onSubmitEditing: apply })}
        />
        <Button size="sm" onPress={apply}>
          {labels.applyLink}
        </Button>
        {linked ? (
          <Button size="sm" variant="ghost" onPress={onRemove}>
            {labels.removeLink}
          </Button>
        ) : null}
        <Button size="sm" variant="ghost" onPress={onCancel}>
          {labels.cancel}
        </Button>
      </XStack>
    </FieldContext.Provider>
  )
}

/** Theme colors for `contentCss`: CSS variables on web, values on native. */
export interface ContentColors {
  text: string
  muted: string
  link: string
  border: string
  code: string
  placeholder: string
}

type FontConfig = {
  family?: string
  size: Record<string, number>
  lineHeight: Record<string, number>
}

/** A size token's pixels, for CSS. */
export const sizePx = (size: RichTextEditorProps['minHeight']) =>
  typeof size === 'number' ? size : (getTokenValue(size as never, 'size') as number | undefined)

/**
 * Styles the HTML being edited the way Rich Text Content draws it, from the
 * theme's tokens: TipTap edits real HTML, which Tamagui does not style.
 */
export function contentCss(
  scope: string,
  colors: ContentColors,
  families: { body: string; mono: string },
) {
  const fonts = getConfig().fonts as Record<string, FontConfig>
  const body = fonts.body!
  const mono = fonts.mono ?? body
  const space = (token: string) => `${getTokenValue(token as never, 'space')}px`
  const type = (font: FontConfig, step: string) =>
    `font-size: ${font.size[step]}px; line-height: ${font.lineHeight[step]}px;`
  return `
${scope} { color: ${colors.text}; font-family: ${families.body}; ${type(body, '2')} padding: ${space('3')}; outline: none; white-space: pre-wrap; overflow-wrap: break-word; }
${scope} :where(p, h1, h2, h3, h4, h5, h6, ul, ol, li, blockquote) { margin: 0; }
${scope} > * + *, ${scope} blockquote > * + * { margin-top: ${space('3')}; }
${scope} h1, ${scope} h2, ${scope} h3, ${scope} h4, ${scope} h5, ${scope} h6 { font-weight: 600; }
${scope} h1 { ${type(body, '5')} }
${scope} h2 { ${type(body, '4')} }
${scope} h3, ${scope} h4, ${scope} h5, ${scope} h6 { ${type(body, '3')} }
${scope} ul, ${scope} ol { padding-inline-start: ${space('6')}; }
${scope} li + li { margin-top: ${space('1')}; }
${scope} li::marker { color: ${colors.muted}; }
${scope} blockquote { border-inline-start: 3px solid ${colors.border}; padding-inline-start: ${space('3')}; }
${scope} code { font-family: ${families.mono}; ${type(mono, '2')} background-color: ${colors.code}; border-radius: ${getTokenValue('xs' as never, 'radius')}px; padding: 0 ${space('1')}; }
${scope} a { color: ${colors.link}; text-decoration: underline; }
${scope} p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: ${colors.placeholder}; float: left; height: 0; pointer-events: none; }
`
}

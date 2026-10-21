import { Fragment, type ReactNode, forwardRef } from 'react'
import {
  type ColorTokens,
  type GetProps,
  ScrollView,
  type TamaguiElement,
  Text as TamaguiText,
  View,
  XStack,
  isWeb,
  styled,
} from 'tamagui/unstyled'
import { CopyButton, type CopyButtonLabels } from '../copy-button/CopyButton'
import { Text } from '../typography/Text'

/** One run of text in a highlighted line. */
export interface CodeToken {
  content: string
  /** A theme color such as `primaryText`, or a CSS color from a highlighter. */
  color?: ColorTokens | (string & {})
  italic?: boolean
  bold?: boolean
}

export interface CodeBlockLabels extends CopyButtonLabels {
  /** Names the code for screen readers when there is no title. Default: "Code". */
  code: string
}

const defaultLabels: CodeBlockLabels = {
  code: 'Code',
  copy: 'Copy code',
  copied: 'Copied',
  failed: 'Couldn’t copy',
}

export const CodeBlockFrame = styled(View, {
  displayName: 'CodeBlock',
  // The floating copy button is placed against the block (web Views are static).
  position: 'relative',
  backgroundColor: "muted",
  borderWidth: 1,
  borderColor: "border",
  borderRadius: "lg",
  overflow: 'hidden'
})

// Every Text sets its own `white-space` on web, so each one takes `wrap`.
const CodeText = styled(TamaguiText, {
  displayName: 'CodeBlockText',
  fontFamily: "mono",
  fontSize: "2",
  lineHeight: "2",
  color: "foreground",
  variants: {
    wrap: {
      true: { whiteSpace: 'pre-wrap' },
      false: { whiteSpace: 'pre' },
    },
  } as const,
  defaultVariants: { wrap: false }
})

// Web: the scroll box. Keyboard users scroll it with the arrow keys once it has focus.
const Pre = styled(View, {
  displayName: 'CodeBlockPre',
  render: 'pre',
  tabIndex: 0,
  margin: 0,
  paddingVertical: "3",
  overflowX: 'auto',
  overflowY: 'auto',
  outlineColor: "focus-visible:ring",
  outlineStyle: "focus-visible:solid",
  outlineWidth: "focus-visible:2px",
  outlineOffset: "focus-visible:-2px"
})

type FrameProps = GetProps<typeof CodeBlockFrame>

export interface CodeBlockProps extends Omit<FrameProps, 'children' | 'onCopy'> {
  /** The code. It is what the copy button copies. */
  code: string
  /** The language, shown in the header, e.g. `tsx` or `bash`. */
  language?: string
  /** A file name or caption, shown in the header; it also names the code. */
  title?: string
  /**
   * The same code as lines of colored tokens, from a highlighter such as
   * Shiki (`codeToTokensBase`). Without it the code is one color.
   */
  tokens?: CodeToken[][]
  /** Numbers each line. Default: false. */
  lineNumbers?: boolean
  /** The first line's number, for an excerpt. Default: 1. */
  firstLineNumber?: number
  /** Line numbers to mark (counting from `firstLineNumber`). */
  highlightLines?: number[]
  /** Wraps long lines instead of scrolling sideways. Default: false. */
  wrap?: boolean
  /** Scrolls the code beyond this height; the header stays. */
  maxHeight?: FrameProps['maxHeight']
  /** Shows a copy button. Default: true. */
  copyable?: boolean
  /** Called with the code once it is copied. */
  onCopy?: (code: string) => void
  /** Copy button and code names, for translation. */
  labels?: Partial<CodeBlockLabels>
}

/** Web CSS values Tamagui's types do not list (`inline-block`, `ch`, `lh`). */
const css = (style: Record<string, string>) => style as object

const toLines = (code: string): CodeToken[][] =>
  // A final newline (as files end) is not an empty last line.
  code
    .replace(/\r?\n$/, '')
    .split(/\r?\n/)
    .map((content) => [{ content }])

function Tokens({ line, wrap }: { line: CodeToken[]; wrap: boolean }) {
  return line.map((token, index) =>
    token.color || token.italic || token.bold ? (
      <CodeText
        key={index}
        wrap={wrap}
        color={(token.color as ColorTokens | undefined) ?? 'foreground'}
        fontStyle={token.italic ? 'italic' : 'normal'}
        fontWeight={token.bold ? '700' : '400'}
      >
        {token.content}
      </CodeText>
    ) : (
      <Fragment key={index}>{token.content}</Fragment>
    ),
  )
}

/**
 * Code in a monospace block with a copy button, optional title, line numbers,
 * highlighted lines and colors from your highlighter. Long lines scroll
 * sideways unless `wrap` is set.
 */
export const CodeBlock = forwardRef<TamaguiElement, CodeBlockProps>(function CodeBlock(
  {
    code,
    language,
    title,
    tokens,
    lineNumbers = false,
    firstLineNumber = 1,
    highlightLines,
    wrap = false,
    maxHeight,
    copyable = true,
    onCopy,
    labels: labelsProp,
    ...props
  },
  ref,
) {
  const labels = { ...defaultLabels, ...labelsProp }
  const lines = tokens ?? toLines(code)
  const marked = new Set(highlightLines)
  const anyMarked = marked.size > 0
  const digits = String(firstLineNumber + lines.length - 1).length
  const header = title || language
  const copyButton = copyable ? (
    <CopyButton
      size="sm"
      value={code}
      onCopy={onCopy}
      labels={{ copy: labels.copy, copied: labels.copied, failed: labels.failed }}
    />
  ) : null
  // Without a header the button floats over the top right; lines leave room for it.
  const floating = copyable && !header

  const lineStyle = (number: number) => {
    const mark = marked.has(number)
    return {
      paddingLeft: '4',
      paddingRight: floating ? '11' : '4',
      // A bar beside marked lines, so the mark is not color alone.
      borderLeftWidth: anyMarked ? 2 : 0,
      borderLeftColor: mark ? 'primary' : 'transparent',
      backgroundColor: mark ? 'primarySoft' : 'transparent',
    } as const
  }
  const lineNumber = (number: number) => String(number).padStart(digits)

  const body = isWeb ? (
    <Pre
      // A group, not a region: a page of code blocks would be a page of landmarks.
      role="group"
      aria-label={title || labels.code}
      maxHeight={maxHeight}
    >
      {/*
        Lines are inline boxes split by newlines (no block boxes inside), so a
        selection copies the code as written, blank lines included.
      */}
      <CodeText render="code" wrap={wrap} alignSelf="flex-start" minWidth="100%">
        {lines.map((line, index) => {
          const number = firstLineNumber + index
          return (
            <Fragment key={index}>
              <CodeText
                wrap={wrap}
                minWidth="100%"
                // An empty line keeps its height (and its mark).
                {...css({ display: 'inline-block', verticalAlign: 'top', minHeight: '1lh' })}
                {...lineStyle(number)}
              >
                {lineNumbers ? (
                  <CodeText
                    {...css({ display: 'inline-block', width: `${digits + 2}ch` })}
                    color="mutedForeground"
                    userSelect="none"
                    aria-hidden
                  >
                    {lineNumber(number)}
                  </CodeText>
                ) : null}
                {lineNumbers && wrap ? (
                  // Wrapped text lines up after the number, not under it.
                  <CodeText
                    wrap
                    {...css({
                      display: 'inline-block',
                      verticalAlign: 'top',
                      width: `calc(100% - ${digits + 2}ch)`,
                    })}
                  >
                    <Tokens line={line} wrap />
                  </CodeText>
                ) : (
                  <Tokens line={line} wrap={wrap} />
                )}
              </CodeText>
              {index < lines.length - 1 ? '\n' : null}
            </Fragment>
          )
        })}
      </CodeText>
    </Pre>
  ) : (
    <NativeScroll maxHeight={maxHeight} wrap={wrap}>
      <View flexGrow={1} paddingVertical="3">
        {lines.map((line, index) => {
          const number = firstLineNumber + index
          return (
            <XStack key={index} {...lineStyle(number)}>
              {lineNumbers ? (
                <CodeText color="mutedForeground" paddingRight="4" aria-hidden>
                  {lineNumber(number)}
                </CodeText>
              ) : null}
              <CodeText userSelect="text" flexShrink={wrap ? 1 : 0}>
                {/* An empty Text has no height. */}
                {line.some((token) => token.content) ? <Tokens line={line} wrap={wrap} /> : ' '}
                {/*
                  Android measures an unwrapped line with italic text (and a
                  line height, or selectable) too narrow and drops its last
                  word onto a hidden second line; a hair space makes room.
                */}
                {!wrap && line.some((token) => token.italic) ? '\u200A' : null}
              </CodeText>
            </XStack>
          )
        })}
      </View>
    </NativeScroll>
  )

  return (
    <CodeBlockFrame ref={ref} {...props}>
      {header ? (
        <XStack
          alignItems="center"
          justifyContent="space-between"
          gap="2"
          minHeight="10"
          paddingLeft="4"
          paddingRight="1"
          borderBottomWidth={1}
          borderColor="border"
        >
          <Text size="xs" tone="muted" mono truncate flexShrink={1}>
            {header}
          </Text>
          <XStack alignItems="center" gap="2">
            {title && language ? (
              <Text size="xs" tone="muted">
                {language}
              </Text>
            ) : null}
            {copyButton}
          </XStack>
        </XStack>
      ) : null}
      {floating ? (
        <View position="absolute" top="1-5" right="1-5" zIndex={1}>
          {copyButton}
        </View>
      ) : null}
      {body}
    </CodeBlockFrame>
  )
})

/** Native: sideways scrolling unless wrapped, inside a vertical scroll when `maxHeight` is set. */
function NativeScroll({
  maxHeight,
  wrap,
  children,
}: {
  maxHeight: CodeBlockProps['maxHeight']
  wrap: boolean
  children: ReactNode
}) {
  const sideways = wrap ? (
    children
  ) : (
    <ScrollView horizontal nestedScrollEnabled contentContainerStyle={{ flexGrow: 1 }}>
      {children}
    </ScrollView>
  )
  if (maxHeight == null) return sideways
  // Android: without it, the screen takes every vertical drag.
  return (
    <ScrollView maxHeight={maxHeight} nestedScrollEnabled>
      {sideways}
    </ScrollView>
  )
}

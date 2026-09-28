import { Fragment, type ReactNode } from 'react'
import { Linking } from 'react-native'
import { type GetProps, View, XStack, isWeb } from 'tamagui'
import { Text, type TextSize } from '../typography/Text'
import { type BlockNode, type InlineNode, parseMarkdown } from './markdown'

const headingSizes = { 1: 'xl', 2: 'lg', 3: 'base' } as const

// Nested text takes the block's size: Text's own default would reset it.
function Inline({ nodes, size }: { nodes: InlineNode[]; size: TextSize }): ReactNode {
  return nodes.map((node, i) => {
    switch (node.type) {
      case 'text':
        return <Fragment key={i}>{node.text}</Fragment>
      case 'code':
        return (
          <Text key={i} mono size={size} backgroundColor="$muted" borderRadius="$xs">
            {` ${node.text} `}
          </Text>
        )
      case 'bold':
        return (
          <Text key={i} size={size} fontWeight="700">
            <Inline nodes={node.children} size={size} />
          </Text>
        )
      case 'italic':
        return (
          <Text key={i} size={size} fontStyle="italic">
            <Inline nodes={node.children} size={size} />
          </Text>
        )
      case 'strike':
        return (
          <Text key={i} size={size} textDecorationLine="line-through">
            <Inline nodes={node.children} size={size} />
          </Text>
        )
      case 'link':
        return (
          <Text
            key={i}
            size={size}
            tone="primary"
            textDecorationLine="underline"
            {...(isWeb
              ? { render: 'a', href: node.href, target: '_blank', rel: 'noopener noreferrer' }
              : { role: 'link', onPress: () => void Linking.openURL(node.href) })}
          >
            <Inline nodes={node.children} size={size} />
          </Text>
        )
    }
  })
}

function Blocks({ blocks, headingOffset }: { blocks: BlockNode[]; headingOffset: number }) {
  return blocks.map((block, i) => {
    switch (block.type) {
      case 'heading': {
        const size = headingSizes[block.level as 1 | 2 | 3] ?? 'base'
        return (
          <Text
            key={i}
            role="heading"
            aria-level={Math.min(6, block.level + headingOffset)}
            size={size}
            weight="semibold"
          >
            <Inline nodes={block.children} size={size} />
          </Text>
        )
      }
      case 'paragraph':
        return (
          <Text key={i} size="sm">
            <Inline nodes={block.children} size="sm" />
          </Text>
        )
      case 'quote':
        return (
          <View key={i} borderLeftWidth={3} borderColor="$border" paddingLeft="$3" gap="$2">
            <Blocks blocks={block.children} headingOffset={headingOffset} />
          </View>
        )
      case 'list':
        return (
          <View key={i} gap="$1" {...(isWeb && { role: 'list' })}>
            {block.items.map((item, j) => (
              <XStack key={j} gap="$2" {...(isWeb && { role: 'listitem' })}>
                <Text aria-hidden size="sm" tone="muted" minWidth="$4" textAlign="right">
                  {block.ordered ? `${block.start + j}.` : '•'}
                </Text>
                <Text size="sm" flex={1}>
                  <Inline nodes={item} size="sm" />
                </Text>
              </XStack>
            ))}
          </View>
        )
    }
  })
}

export interface RichTextContentProps extends Omit<GetProps<typeof View>, 'children'> {
  /** Markdown, as written by Rich Text Editor. */
  children: string
  /** Added to heading levels: with 1 (default), `#` is an h2 under your page's h1. */
  headingOffset?: number
}

/** Shows Markdown written with Rich Text Editor, with the same styles on every platform. */
export function RichTextContent({ children, headingOffset = 1, ...props }: RichTextContentProps) {
  return (
    <View gap="$3" {...props}>
      <Blocks blocks={parseMarkdown(children)} headingOffset={headingOffset} />
    </View>
  )
}

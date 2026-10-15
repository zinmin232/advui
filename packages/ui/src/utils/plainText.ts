import { type ReactNode, isValidElement } from 'react'

// The text inside a node, like a browser's accessible name.
function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children)
  return ''
}

/**
 * The text of a label or help text, with runs of whitespace collapsed. Native
 * has no aria-labelledby or aria-describedby, so controls pass text instead.
 */
export const plainText = (node: ReactNode) => textOf(node).replace(/\s+/g, ' ').trim()

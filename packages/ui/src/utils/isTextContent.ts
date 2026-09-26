import type { ReactNode } from 'react'

/**
 * True for children that are only text: `"Save"`, `3`, or `Status ({count})`
 * (JSX turns that into `['Status (', 3, ')']`). Such children must be wrapped in
 * a Text component: React Native throws on bare strings inside a View.
 */
export function isTextContent(
  children: ReactNode,
): children is string | number | Array<string | number> {
  if (typeof children === 'string' || typeof children === 'number') return true
  return (
    Array.isArray(children) &&
    children.length > 0 &&
    children.every((child) => typeof child === 'string' || typeof child === 'number')
  )
}

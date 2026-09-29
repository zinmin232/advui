import { components } from '@advui/catalog'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { PlaygroundPage } from '../../components/playground-page'

export const metadata: Metadata = {
  title: 'Playground',
  description: 'Tweak component props and theme tokens live, then copy JSX and theme config.',
}

export default function Playground() {
  const playable = components
    .filter((c) => c.playground)
    .map(({ slug, name, playground }) => ({ slug, name, playground }))
  return (
    <Suspense>
      <PlaygroundPage components={playable} />
    </Suspense>
  )
}

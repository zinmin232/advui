import type { Metadata } from 'next'
import { ExamplesGallery } from '../../components/app-examples'

export const metadata: Metadata = {
  title: 'Examples',
  description: 'Realistic application screens built with Adv UI.',
}

export default function ExamplesPage() {
  return <ExamplesGallery />
}

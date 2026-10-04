import { describe, expect, it } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Heading } from '../typography/Heading'
import { Text } from '../typography/Text'
import { Section, sectionPadding } from './Section'

describe('sectionPadding', () => {
  it('grows each step at md', () => {
    expect(sectionPadding('md')).toEqual({
      paddingVertical: '$12',
      $md: { paddingVertical: '$16' },
    })
    expect(sectionPadding('none')).toEqual({ paddingVertical: '$0' })
  })

  it('combines a map with the md step, emitting only changes', () => {
    expect(sectionPadding({ base: 'sm', lg: 'xl' })).toEqual({
      paddingVertical: '$6',
      $md: { paddingVertical: '$8' },
      $lg: { paddingVertical: '$32' },
    })
    // A map without base starts at the default step.
    expect(sectionPadding({ xl: 'lg' })).toEqual({
      paddingVertical: '$12',
      $md: { paddingVertical: '$16' },
      $xl: { paddingVertical: '$24' },
    })
  })
})

describe('Section', () => {
  it('is a named section landmark with an anchor id', () => {
    renderWithProvider(
      <Section id="features" aria-labelledby="features-title">
        <Heading id="features-title" level={2}>
          Features
        </Heading>
      </Section>,
    )
    const region = screen.getByRole('region', { name: 'Features' })
    expect(region.tagName).toBe('SECTION')
    expect(region).toHaveAttribute('id', 'features')
  })

  it('wraps its children in a Container unless told not to', () => {
    const view = renderWithProvider(
      <Section aria-label="Band">
        <Text>Inside</Text>
      </Section>,
    )
    expect(screen.getByText('Inside').parentElement).not.toBe(screen.getByRole('region'))
    view.unmount()
    renderWithProvider(
      <Section aria-label="Band" container="none">
        <Text>Inside</Text>
      </Section>,
    )
    expect(screen.getByText('Inside').parentElement).toBe(screen.getByRole('region'))
  })

  it('switches primary and inverse bands to their sub-themes', () => {
    renderWithProvider(
      <>
        <Section aria-label="Primary" background="primary">
          <Text>On primary</Text>
        </Section>
        <Section aria-label="Inverse" background="inverse">
          <Text>On inverse</Text>
        </Section>
        <Section aria-label="Muted" background="muted">
          <Text>On muted</Text>
        </Section>
      </>,
    )
    const themeOf = (name: string) =>
      screen.getByRole('region', { name }).closest('[class*="t_"]')?.className ?? ''
    expect(themeOf('Primary')).toMatch(/primary/)
    expect(themeOf('Inverse')).toMatch(/inverse/)
    expect(themeOf('Muted')).not.toMatch(/primary|inverse/)
  })
})

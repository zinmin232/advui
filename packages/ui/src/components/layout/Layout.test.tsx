import { describe, expect, it } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Heading } from '../typography/Heading'
import { Text } from '../typography/Text'
import { Grid } from './Grid'
import { Container } from './Container'
import { Center, HStack, Spacer, VStack } from './Stack'

describe('layout primitives', () => {
  it('wraps each grid child in an equal-width cell', () => {
    renderWithProvider(
      <Grid columns={{ base: 1, md: 3 }} gap="$4" testID="grid">
        <Text>One</Text>
        <Text>Two</Text>
        <Text>Three</Text>
      </Grid>,
    )
    const grid = screen.getByTestId('grid')
    expect(grid.children).toHaveLength(3)
  })

  it('renders stacks, spacer and container without extra semantics', () => {
    renderWithProvider(
      <Container>
        <VStack gap="$2">
          <HStack gap="$2">
            <Text>Left</Text>
            <Spacer testID="spacer" />
            <Text>Right</Text>
          </HStack>
          <Center>
            <Text>Centered</Text>
          </Center>
        </VStack>
      </Container>,
    )
    expect(screen.getByTestId('spacer')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('Centered')).toBeInTheDocument()
  })

  it('renders semantic headings with levels', () => {
    renderWithProvider(<Heading level={3}>Section</Heading>)
    const heading = screen.getByRole('heading', { level: 3, name: 'Section' })
    expect(heading.tagName).toBe('H3')
  })
})

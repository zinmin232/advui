import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Button } from '../button/Button'
import { Card } from './Card'

describe('Card', () => {
  it('composes header, content and footer', () => {
    renderWithProvider(
      <Card>
        <Card.Header>
          <Card.Title>Account</Card.Title>
          <Card.Description>Manage your account</Card.Description>
        </Card.Header>
        <Card.Content>
          <Card.Description>Body</Card.Description>
        </Card.Content>
        <Card.Footer>
          <Button>Save</Button>
        </Card.Footer>
      </Card>,
    )
    expect(screen.getByRole('heading', { name: 'Account' })).toBeInTheDocument()
    expect(screen.getByText('Manage your account')).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('can be made interactive', async () => {
    const onPress = vi.fn()
    const { user } = renderWithProvider(
      <Card interactive role="button" aria-label="Open project" onPress={onPress}>
        <Card.Content>
          <Card.Title>Project</Card.Title>
        </Card.Content>
      </Card>,
    )
    await user.click(screen.getByRole('button', { name: 'Open project' }))
    expect(onPress).toHaveBeenCalledOnce()
  })
})

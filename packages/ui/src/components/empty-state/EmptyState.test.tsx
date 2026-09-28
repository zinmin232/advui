import { describe, expect, it } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Button } from '../button/Button'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('renders a heading, description and actions', () => {
    renderWithProvider(
      <EmptyState title="No projects" description="Create one to start." headingLevel={2}>
        <Button>New project</Button>
      </EmptyState>,
    )
    expect(screen.getByRole('heading', { level: 2, name: 'No projects' })).toBeInTheDocument()
    expect(screen.getByText('Create one to start.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New project' })).toBeInTheDocument()
  })
})

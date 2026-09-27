import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen, within } from '../../../test/utils'
import { Breadcrumb } from './Breadcrumb'

describe('Breadcrumb', () => {
  it('is a named nav landmark with an ordered list and the current page last', () => {
    renderWithProvider(
      <Breadcrumb>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item href="/projects">Projects</Breadcrumb.Item>
        <Breadcrumb.Item>Atlas</Breadcrumb.Item>
      </Breadcrumb>,
    )
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' })
    const list = within(nav).getByRole('list')
    expect(within(list).getAllByRole('listitem')).toHaveLength(3)

    const home = within(nav).getByRole('link', { name: 'Home' })
    expect(home).toHaveAttribute('href', '/')
    expect(within(nav).getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/projects')
    expect(within(nav).queryByRole('link', { name: 'Atlas' })).toBeNull()
    expect(within(nav).getByText('Atlas')).toHaveAttribute('aria-current', 'page')
  })

  it('calls onPress for router navigation', async () => {
    const onPress = vi.fn()
    const { user } = renderWithProvider(
      <Breadcrumb>
        <Breadcrumb.Item onPress={onPress}>Projects</Breadcrumb.Item>
        <Breadcrumb.Item>Atlas</Breadcrumb.Item>
      </Breadcrumb>,
    )
    await user.click(screen.getByRole('link', { name: 'Projects' }))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('collapses the middle of a long path until expanded', async () => {
    const pages = ['Home', 'Acme', 'Workspaces', 'Design', 'Atlas', 'Billing']
    const { user } = renderWithProvider(
      <Breadcrumb maxItems={3}>
        {pages.map((page) => (
          <Breadcrumb.Item key={page} href={`/${page}`}>
            {page}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>,
    )
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.queryByText('Workspaces')).toBeNull()
    expect(screen.getByRole('link', { name: 'Atlas' })).toBeInTheDocument()
    expect(screen.getByText('Billing')).toHaveAttribute('aria-current', 'page')

    await user.click(screen.getByRole('button', { name: 'Show 3 more' }))
    expect(screen.getByRole('link', { name: 'Workspaces' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(6)
    expect(screen.queryByRole('button', { name: /Show/ })).toBeNull()
  })

  it('hides separators from assistive technology', () => {
    renderWithProvider(
      <Breadcrumb separator={<span data-testid="sep">/</span>}>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item>Atlas</Breadcrumb.Item>
      </Breadcrumb>,
    )
    const separators = screen.getAllByTestId('sep')
    expect(separators).toHaveLength(1)
    expect(separators[0]?.closest('[aria-hidden="true"]')).not.toBeNull()
  })
})

import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Pagination, getPaginationItems } from './Pagination'

describe('getPaginationItems', () => {
  it('lists every page when they fit', () => {
    expect(getPaginationItems(1, 5)).toEqual([1, 2, 3, 4, 5])
    expect(getPaginationItems(1, 1)).toEqual([1])
  })

  it('collapses skipped ranges and keeps the item count steady', () => {
    expect(getPaginationItems(1, 10)).toEqual([1, 2, 3, 4, 5, 'end-ellipsis', 10])
    expect(getPaginationItems(6, 10)).toEqual([1, 'start-ellipsis', 5, 6, 7, 'end-ellipsis', 10])
    expect(getPaginationItems(10, 10)).toEqual([1, 'start-ellipsis', 6, 7, 8, 9, 10])
  })

  it('takes siblings and boundaries', () => {
    expect(getPaginationItems(10, 20, { siblings: 2, boundaries: 2 })).toEqual([
      1,
      2,
      'start-ellipsis',
      8,
      9,
      10,
      11,
      12,
      'end-ellipsis',
      19,
      20,
    ])
  })
})

describe('Pagination', () => {
  it('is a named navigation with the current page marked', () => {
    renderWithProvider(<Pagination count={10} defaultPage={6} />)
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page 6' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Page 5' })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('button', { name: 'Page 10' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Page 3' })).not.toBeInTheDocument()
  })

  it('moves with the page, previous and next buttons', async () => {
    const onPageChange = vi.fn()
    const { user } = renderWithProvider(<Pagination count={5} onPageChange={onPageChange} />)
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenLastCalledWith(2)
    await user.click(screen.getByRole('button', { name: 'Page 5' }))
    expect(onPageChange).toHaveBeenLastCalledWith(5)
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Previous page' }))
    expect(screen.getByRole('button', { name: 'Page 4' })).toHaveAttribute('aria-current', 'page')
  })

  it('follows a controlled page', async () => {
    const onPageChange = vi.fn()
    const { user } = renderWithProvider(
      <Pagination count={5} page={3} onPageChange={onPageChange} />,
    )
    await user.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenCalledWith(4)
    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page')
  })

  it('shows the position as text in the compact variant, with custom labels', () => {
    renderWithProvider(
      <Pagination
        count={24}
        defaultPage={3}
        variant="compact"
        aria-label="Results pages"
        labels={{ status: (page, count) => `${page} / ${count}`, next: 'Next' }}
      />,
    )
    expect(screen.getByRole('navigation', { name: 'Results pages' })).toBeInTheDocument()
    expect(screen.getByText('3 / 24')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Page 3' })).not.toBeInTheDocument()
  })

  it('disables every button', () => {
    renderWithProvider(<Pagination count={3} defaultPage={2} disabled />)
    for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled()
  })
})

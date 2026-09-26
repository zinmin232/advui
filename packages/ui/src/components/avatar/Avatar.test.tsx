import { describe, expect, it } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Avatar, getInitials } from './Avatar'

describe('Avatar', () => {
  it('derives initials from the accessible name', () => {
    expect(getInitials('Ada Lovelace')).toBe('AL')
    expect(getInitials('  grace  hopper  murray ')).toBe('GH')
    expect(getInitials(undefined)).toBe('')
  })

  it('exposes one image with the alt text and shows initials as fallback', () => {
    renderWithProvider(<Avatar alt="Ada Lovelace" />)
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toBeInTheDocument()
    expect(screen.getByText('AL')).toBeInTheDocument()
  })

  it('prefers an explicit fallback', () => {
    renderWithProvider(<Avatar alt="Team" fallback="UI" size="lg" />)
    expect(screen.getByText('UI')).toBeInTheDocument()
  })
})

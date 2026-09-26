import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { createUniversalConfig } from '@advui/theme'
import type { ReactNode } from 'react'
import { TamaguiProvider } from 'tamagui'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { IconDefaults, IconProvider } from './context'
import { createIcon } from './createIcon'
import { iconNames } from './generated'
import { Icon } from './Icon'
import { SearchIcon, defaultIcons } from './icons'

const config = createUniversalConfig()
const wrap = (ui: ReactNode) =>
  render(
    <TamaguiProvider config={config} defaultTheme="light">
      {ui}
    </TamaguiProvider>,
  )

afterEach(cleanup)

describe('icons', () => {
  it('ships every generated icon in the default registry', () => {
    expect(Object.keys(defaultIcons).sort()).toEqual([...iconNames].sort())
    expect(iconNames.length).toBeGreaterThan(40)
  })

  it('is decorative by default and becomes an image when labelled', () => {
    wrap(
      <>
        <SearchIcon testID="decorative" />
        <SearchIcon aria-label="Search" />
      </>,
    )
    expect(screen.getByTestId('decorative')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('img', { name: 'Search' })).toBeInTheDocument()
  })

  it('resolves icons by name and lets IconProvider replace them', () => {
    const Custom = createIcon('search', [['circle', { cx: 12, cy: 12, r: 4 }]])
    wrap(
      <>
        <Icon name="search" testID="builtin" />
        <IconProvider icons={{ search: Custom }}>
          <Icon name="search" testID="custom" />
        </IconProvider>
      </>,
    )
    expect(screen.getByTestId('builtin').querySelector('path')).not.toBeNull()
    expect(screen.getByTestId('custom').querySelectorAll('circle')).toHaveLength(1)
  })

  it('warns and renders nothing for unknown names', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { container } = wrap(<Icon name="does-not-exist" />)
    expect(container.querySelector('svg')).toBeNull()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('does-not-exist'))
    warn.mockRestore()
  })

  it('inherits size and color from IconDefaults and resolves theme tokens to CSS variables', () => {
    wrap(
      <IconDefaults size={24} color="$primary">
        <SearchIcon testID="inherited" />
      </IconDefaults>,
    )
    const svg = screen.getByTestId('inherited')
    expect(svg).toHaveAttribute('width', '24')
    expect(svg.getAttribute('style')).toContain('var(--primary)')
  })
})

import { describe, expect, it } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Badge } from '../badge/Badge'
import { DescriptionList } from './DescriptionList'

describe('DescriptionList', () => {
  it('is a dl of terms and their details', () => {
    const { container } = renderWithProvider(
      <DescriptionList>
        <DescriptionList.Item term="Order">#4021</DescriptionList.Item>
        <DescriptionList.Item term="Status">
          <Badge variant="success">Paid</Badge>
        </DescriptionList.Item>
      </DescriptionList>,
    )
    const list = container.querySelector('dl')!
    expect(list).toBeInTheDocument()
    const terms = screen.getAllByRole('term')
    expect(terms.map((term) => term.textContent)).toEqual(['Order', 'Status'])
    const details = screen.getAllByRole('definition')
    expect(details.map((detail) => detail.textContent)).toEqual(['#4021', 'Paid'])
    // Each pair sits in a div, the one wrapper a dl allows.
    for (const term of terms) {
      expect(term.parentElement!.tagName).toBe('DIV')
      expect(term.parentElement!.parentElement).toBe(list)
      expect(term.nextElementSibling!.tagName).toBe('DD')
    }
    // Browser margins on dl and dd are reset.
    expect(list).toHaveStyle({ margin: '0px' })
    expect(details[0]).toHaveStyle({ margin: '0px' })
  })

  it('puts the term beside its details, or above them', () => {
    renderWithProvider(
      <>
        <DescriptionList termWidth={120}>
          <DescriptionList.Item term="Beside">One</DescriptionList.Item>
        </DescriptionList>
        <DescriptionList orientation="vertical">
          <DescriptionList.Item term="Above">Two</DescriptionList.Item>
        </DescriptionList>
      </>,
    )
    const beside = screen.getByText('Beside')
    expect(beside).toHaveStyle({ width: '120px' })
    expect(beside.parentElement).toHaveStyle({ flexDirection: 'row' })
    const above = screen.getByText('Above')
    expect(above.parentElement).toHaveStyle({ flexDirection: 'column' })
    expect(above.style.width).toBe('')
  })

  it('draws a line above every item but the first when divided', () => {
    renderWithProvider(
      <DescriptionList divided>
        <DescriptionList.Item term="First">1</DescriptionList.Item>
        <DescriptionList.Item term="Second">2</DescriptionList.Item>
      </DescriptionList>,
    )
    const [first, second] = screen.getAllByRole('term').map((term) => term.parentElement!)
    expect(getComputedStyle(first!).borderTopWidth).not.toBe('1px')
    expect(second).toHaveStyle({ borderTopWidth: '1px' })
  })
})

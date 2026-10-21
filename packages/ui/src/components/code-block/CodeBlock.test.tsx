import { View } from 'tamagui/unstyled'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Text } from '../typography/Text'
import { CodeBlock } from './CodeBlock'

const source = 'const a = 1\n\n  return a\n'
const code = () => document.querySelector('pre code')!

describe('CodeBlock', () => {
  it('shows the code as written in a focusable pre, named by its title', () => {
    renderWithProvider(<CodeBlock title="main.ts" language="ts" code={source} />)
    const group = screen.getByRole('group', { name: 'main.ts' })
    expect(group.tagName).toBe('PRE')
    expect(group).toHaveAttribute('tabindex', '0')
    // Blank line and indent kept; the final newline is not an extra line.
    expect(code().textContent).toBe('const a = 1\n\n  return a')
    expect(screen.getByText('main.ts')).toBeInTheDocument()
    expect(screen.getByText('ts')).toBeInTheDocument()
  })

  it('copies the code with its button', async () => {
    const onCopy = vi.fn()
    const { user } = renderWithProvider(<CodeBlock code={source} onCopy={onCopy} />)
    const group = screen.getByRole('group', { name: 'Code' })
    // The floating button is placed against the block, not the page.
    expect(getComputedStyle(group.parentElement!).position).toBe('relative')
    await user.click(screen.getByRole('button', { name: 'Copy code' }))
    expect(await navigator.clipboard.readText()).toBe(source)
    expect(onCopy).toHaveBeenCalledWith(source)
    expect(screen.getByRole('status')).toHaveTextContent('Copied')
  })

  it('leaves out the button when not copyable', () => {
    renderWithProvider(<CodeBlock code="ls" copyable={false} />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('numbers lines from firstLineNumber, hidden from screen readers and selection', () => {
    renderWithProvider(<CodeBlock code={'a\nb\nc'} lineNumbers firstLineNumber={9} />)
    const numbers = [...code().querySelectorAll('[aria-hidden="true"]')]
    expect(numbers.map((number) => number.textContent)).toEqual([' 9', '10', '11'])
    expect(getComputedStyle(numbers[0]!).userSelect).toBe('none')
  })

  it('marks highlighted lines', () => {
    renderWithProvider(
      <>
        <CodeBlock code={'one\ntwo\nthree'} highlightLines={[2]} />
        <View testID="soft" backgroundColor="primarySoft" />
      </>,
    )
    const [one, two] = [...code().children] as HTMLElement[]
    const soft = getComputedStyle(screen.getByTestId('soft')).backgroundColor
    expect(getComputedStyle(two!).backgroundColor).toBe(soft)
    expect(getComputedStyle(one!).backgroundColor).not.toBe(soft)
  })

  it('colors tokens', () => {
    renderWithProvider(
      <>
        <CodeBlock
          code="let x"
          tokens={[
            [{ content: 'let', color: 'infoSoftForeground', bold: true }, { content: ' x' }],
          ]}
        />
        <Text color="infoSoftForeground">reference</Text>
      </>,
    )
    expect(code().textContent).toBe('let x')
    const keyword = screen.getByText('let')
    expect(getComputedStyle(keyword).color).toBe(
      getComputedStyle(screen.getByText('reference')).color,
    )
    expect(getComputedStyle(keyword).fontWeight).toBe('700')
  })

  it('wraps long lines only when asked', () => {
    renderWithProvider(
      <>
        <CodeBlock code="x" />
        <CodeBlock code="y" wrap />
      </>,
    )
    const [plain, wrapped] = [...document.querySelectorAll('pre code')] as HTMLElement[]
    expect(getComputedStyle(plain!).whiteSpace).toBe('pre')
    expect(getComputedStyle(wrapped!).whiteSpace).toBe('pre-wrap')
  })
})

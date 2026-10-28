import { useRef, useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Button } from '../button/Button'
import { Tour, type TourProps } from './Tour'

afterEach(() => {
  vi.restoreAllMocks()
})

function Example(props: Partial<TourProps>) {
  const search = useRef(null)
  const create = useRef(null)
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onPress={() => setOpen(true)}>Take the tour</Button>
      <Button ref={search}>Search</Button>
      <Button ref={create}>New project</Button>
      <Tour
        open={open}
        onOpenChange={setOpen}
        steps={[
          { title: 'Welcome', description: 'A quick look around.' },
          { target: search, title: 'Search', description: 'Find any file.' },
          { target: create, title: 'New project', description: 'Start here.' },
        ]}
        {...props}
      />
    </>
  )
}

describe('Tour', () => {
  it('opens a modal card named by its step, with focus on it', async () => {
    const { user } = renderWithProvider(<Example />)
    expect(screen.queryByRole('dialog')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Take the tour' }))
    const card = await screen.findByRole('dialog', { name: 'Welcome' })
    expect(card).toHaveAttribute('aria-modal', 'true')
    expect(card).toHaveAccessibleDescription('Step 1 of 3 A quick look around.')
    expect(card).toHaveFocus()
    // The first step has no Back.
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull()
  })

  it('walks the steps, completes, and gives focus back', async () => {
    const onComplete = vi.fn()
    const onStepChange = vi.fn()
    const { user } = renderWithProvider(
      <Example onComplete={onComplete} onStepChange={onStepChange} />,
    )
    const opener = screen.getByRole('button', { name: 'Take the tour' })
    await user.click(opener)
    await user.click(await screen.findByRole('button', { name: 'Next' }))
    expect(onStepChange).toHaveBeenLastCalledWith(1)
    expect(screen.getByRole('dialog', { name: 'Search' })).toHaveAccessibleDescription(
      'Step 2 of 3 Find any file.',
    )
    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('dialog', { name: 'Welcome' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    // The last step has Done and no Skip.
    expect(screen.queryByRole('button', { name: 'Skip tour' })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Done' }))
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(opener).toHaveFocus()
    // It starts from the first step again.
    await user.click(opener)
    expect(await screen.findByRole('dialog', { name: 'Welcome' })).toBeInTheDocument()
  })

  it('closes with Escape or Skip, without completing', async () => {
    const onComplete = vi.fn()
    const { user } = renderWithProvider(<Example onComplete={onComplete} />)
    await user.click(screen.getByRole('button', { name: 'Take the tour' }))
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Take the tour' }))
    await user.click(await screen.findByRole('button', { name: 'Skip tour' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('keeps Tab inside the card', async () => {
    const { user } = renderWithProvider(<Example defaultStep={1} />)
    await user.click(screen.getByRole('button', { name: 'Take the tour' }))
    await screen.findByRole('dialog', { name: 'Search' })
    await user.tab()
    expect(screen.getByRole('button', { name: 'Skip tour' })).toHaveFocus()
    await user.tab()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Skip tour' })).toHaveFocus()
    await user.tab({ shift: true })
    expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus()
  })

  it('places the card below a target in the top half, and rings the target', async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      return (
        this.textContent === 'Search'
          ? { left: 100, top: 40, width: 80, height: 32 }
          : { left: 0, top: 0, width: 0, height: 0 }
      ) as DOMRect
    })
    const { user } = renderWithProvider(<Example defaultStep={1} />)
    await user.click(screen.getByRole('button', { name: 'Take the tour' }))
    const card = await screen.findByRole('dialog', { name: 'Search' })
    // 4px around the target, then 12px to the card.
    expect(card).toHaveStyle({ position: 'absolute', top: `${40 + 32 + 4 + 12}px` })
  })
})

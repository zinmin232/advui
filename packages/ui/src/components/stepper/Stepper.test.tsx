import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Stepper } from './Stepper'

function Steps(props: Partial<Parameters<typeof Stepper>[0]>) {
  return (
    <Stepper activeStep={1} aria-label="Progress" {...props}>
      <Stepper.Step title="Organization" description="Name and type" />
      <Stepper.Step title="Activities" />
      <Stepper.Step title="Review" />
    </Stepper>
  )
}

describe('Stepper', () => {
  it('is a list of steps that names each step and its status', () => {
    renderWithProvider(<Steps />)
    expect(screen.getByRole('list', { name: 'Progress' })).toBeInTheDocument()
    const [first, second, third] = screen.getAllByRole('listitem')
    expect(first).toHaveTextContent('Step 1 of 3: Organization, completedName and type')
    expect(second).toHaveTextContent('Step 2 of 3: Activities, current')
    expect(third).toHaveTextContent('Step 3 of 3: Review, not started')
    expect(second!.querySelector('[aria-current="step"]')).not.toBeNull()
    expect(first!.querySelector('[aria-current]')).toBeNull()
  })

  it('shows an error status', () => {
    renderWithProvider(
      <Stepper activeStep={0}>
        <Stepper.Step title="Upload" status="error" />
      </Stepper>,
    )
    expect(screen.getByRole('listitem')).toHaveTextContent('Upload, has errors')
  })

  it('has no buttons without onStepPress', () => {
    renderWithProvider(<Steps />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('lets reached steps be pressed when linear', async () => {
    const onStepPress = vi.fn()
    const { user } = renderWithProvider(<Steps onStepPress={onStepPress} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)
    await user.click(screen.getByRole('button', { name: /Organization/ }))
    expect(onStepPress).toHaveBeenCalledWith(0)
    expect(screen.queryByRole('button', { name: /Review/ })).not.toBeInTheDocument()
  })

  it('lets any step be pressed when not linear, from the keyboard too', async () => {
    const onStepPress = vi.fn()
    const { user } = renderWithProvider(<Steps onStepPress={onStepPress} linear={false} />)
    expect(screen.getAllByRole('button')).toHaveLength(3)
    screen.getByRole('button', { name: /Review/ }).focus()
    await user.keyboard('{Enter}')
    expect(onStepPress).toHaveBeenCalledWith(2)
  })

  it('shows the current step’s content when vertical', () => {
    renderWithProvider(
      <Stepper activeStep={1} orientation="vertical">
        <Stepper.Step title="One">
          <span>First form</span>
        </Stepper.Step>
        <Stepper.Step title="Two">
          <span>Second form</span>
        </Stepper.Step>
      </Stepper>,
    )
    expect(screen.queryByText('First form')).not.toBeInTheDocument()
    expect(screen.getByText('Second form')).toBeInTheDocument()
  })

  it('translates the screen-reader text', () => {
    renderWithProvider(
      <Stepper
        activeStep={0}
        labels={{
          step: (n, count) => `${n}/${count}`,
          status: { complete: 'done', current: 'now', upcoming: 'later', error: 'error' },
        }}
      >
        <Stepper.Step title="One" />
      </Stepper>,
    )
    expect(screen.getByRole('listitem')).toHaveTextContent('1/1: One, now')
  })
})

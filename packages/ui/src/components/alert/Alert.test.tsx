import { describe, expect, it } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Alert } from './Alert'

describe('Alert', () => {
  it('uses the assertive alert role for errors and warnings', () => {
    renderWithProvider(
      <Alert variant="error">
        <Alert.Title>Payment failed</Alert.Title>
        <Alert.Description>Update your card.</Alert.Description>
      </Alert>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Payment failed')
  })

  it('uses the polite status role for informational variants', () => {
    renderWithProvider(
      <Alert variant="success" icon={null}>
        <Alert.Title>Saved</Alert.Title>
      </Alert>,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Saved')
  })
})

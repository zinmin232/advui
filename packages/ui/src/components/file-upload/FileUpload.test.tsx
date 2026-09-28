import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { FormField } from '../form-field/FormField'
import { FileUpload } from './FileUpload'
import { formatBytes, matchesAccept } from './files'

const pdf = (name: string, bytes = 1000) =>
  new File(['x'.repeat(bytes)], name, { type: 'application/pdf' })

describe('FileUpload', () => {
  it('is a labelled button; picked files are listed with remove buttons', async () => {
    const onValueChange = vi.fn()
    const { user, container } = renderWithProvider(
      <FormField label="Résumé">
        <FileUpload accept=".pdf" onValueChange={onValueChange} />
      </FormField>,
    )
    expect(screen.getByRole('button', { name: 'Résumé' })).toBeInTheDocument()
    expect(screen.getByText('No file chosen')).toBeInTheDocument()
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toHaveAttribute('accept', '.pdf')

    await user.upload(input, pdf('cv.pdf'))
    expect(onValueChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: 'cv.pdf' })])
    expect(screen.getByRole('listitem')).toHaveTextContent('cv.pdf')
    await user.click(screen.getByRole('button', { name: 'Remove cv.pdf' }))
    expect(onValueChange).toHaveBeenLastCalledWith([])
  })

  it('rejects files by type, size and count', async () => {
    const onReject = vi.fn()
    const onValueChange = vi.fn()
    const pickFiles = vi.fn(async () => [
      { name: 'a.pdf', size: 100, type: 'application/pdf' },
      { name: 'b.png', size: 100, type: 'image/png' },
      { name: 'c.pdf', size: 9000, type: 'application/pdf' },
      { name: 'd.pdf', size: 100, type: 'application/pdf' },
    ])
    const { user } = renderWithProvider(
      <FileUpload
        multiple
        accept=".pdf"
        maxSize={1000}
        maxFiles={1}
        pickFiles={pickFiles}
        onReject={onReject}
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Choose files' }))
    expect(pickFiles).toHaveBeenCalledWith({ multiple: true, accept: '.pdf' })
    expect(onValueChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: 'a.pdf' })])
    expect(onReject.mock.calls[0]![0].map((r: { reason: string }) => r.reason)).toEqual([
      'type',
      'size',
      'count',
    ])
  })

  it('matches accept rules and formats sizes', () => {
    expect(matchesAccept({ name: 'a.PNG', type: 'image/png' }, 'image/*')).toBe(true)
    expect(matchesAccept({ name: 'a.pdf' }, '.pdf,.doc')).toBe(true)
    expect(matchesAccept({ name: 'a.txt', type: 'text/plain' }, 'image/*,.pdf')).toBe(false)
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(1_840_000)).toBe('1.8 MB')
  })
})

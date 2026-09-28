import { fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { FileDropzone } from './FileDropzone'

const image = (name: string) => new File(['x'], name, { type: 'image/png' })

describe('FileDropzone', () => {
  it('is one button named by its text that opens the picker from the keyboard', async () => {
    const pickFiles = vi.fn(async () => [{ name: 'a.png', size: 1, type: 'image/png' }])
    const { user } = renderWithProvider(
      <FileDropzone pickFiles={pickFiles} description="PNG only" />,
    )
    const zone = screen.getByRole('button', { name: /Drop files here or click to browse/ })
    zone.focus()
    await user.keyboard('{Enter}')
    expect(pickFiles).toHaveBeenCalledOnce()
    expect(await screen.findByRole('listitem')).toHaveTextContent('a.png')
  })

  it('highlights while files are dragged over and adds dropped files that match accept', async () => {
    const onValueChange = vi.fn()
    const onReject = vi.fn()
    renderWithProvider(
      <FileDropzone accept="image/*" onValueChange={onValueChange} onReject={onReject} />,
    )
    const zone = screen.getByRole('button')
    const files = [image('a.png'), new File(['x'], 'notes.txt', { type: 'text/plain' })]
    const dataTransfer = { files, types: ['Files'] }
    fireEvent.dragEnter(zone, { dataTransfer })
    expect(zone.className).toMatch(/accent/)
    fireEvent.drop(zone, { dataTransfer })
    expect(onValueChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: 'a.png' })])
    expect(onReject).toHaveBeenCalledWith([expect.objectContaining({ reason: 'type' })])
    expect(zone.className).not.toMatch(/accent/)
  })
})

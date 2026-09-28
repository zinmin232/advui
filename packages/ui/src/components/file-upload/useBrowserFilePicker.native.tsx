import type { PickedFile } from './files'

/** Native has no browser dialog; the app's picker (`setFilePicker`) is used instead. */
export function useBrowserFilePicker(_options: {
  accept?: string
  multiple: boolean
  onFiles: (files: PickedFile[]) => void
}): { element: null; open: undefined } {
  return { element: null, open: undefined }
}

import { useRef } from 'react'
import { type PickedFile, fromBrowserFiles } from './files'

/**
 * Web: a hidden `<input type="file">` that opens the browser's file dialog.
 * Render `element` anywhere in the component.
 */
export function useBrowserFilePicker({
  accept,
  multiple,
  onFiles,
}: {
  accept?: string
  multiple: boolean
  onFiles: (files: PickedFile[]) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  const element = (
    <input
      ref={ref}
      type="file"
      hidden
      aria-hidden
      tabIndex={-1}
      accept={accept}
      multiple={multiple}
      onChange={(event) => {
        const { files } = event.currentTarget
        if (files?.length) onFiles(fromBrowserFiles(files))
        // Picking the same file again must fire another change.
        event.currentTarget.value = ''
      }}
    />
  )
  return { element, open: () => ref.current?.click() }
}

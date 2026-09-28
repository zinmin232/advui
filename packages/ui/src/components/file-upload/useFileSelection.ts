import { useEffect } from 'react'
import { isWeb } from 'tamagui'
import { useControllableState } from '../../hooks/useControllableState'
import {
  type FileRejection,
  type PickFiles,
  type PickedFile,
  getFilePicker,
  matchesAccept,
} from './files'
import { useBrowserFilePicker } from './useBrowserFilePicker'

export interface FileSelectionProps {
  value?: PickedFile[]
  defaultValue?: PickedFile[]
  onValueChange?: (files: PickedFile[]) => void
  /** Allow several files; otherwise a new pick replaces the file. */
  multiple?: boolean
  /** Allowed types, as in `<input accept>`: `image/*,.pdf`. Also checked on drop and on native. */
  accept?: string
  /** Largest allowed file in bytes. */
  maxSize?: number
  /** Most files kept when `multiple`. */
  maxFiles?: number
  /** Called with the files that were refused and why. */
  onReject?: (rejections: FileRejection[]) => void
  /** This component's picker. Defaults to the browser dialog on web and `setFilePicker` on native. */
  pickFiles?: PickFiles
}

const none: PickedFile[] = []
let warned = false

/** Picked files, validation and the platform picker, shared by File Upload and File Dropzone. */
export function useFileSelection({
  value,
  defaultValue = none,
  onValueChange,
  multiple = false,
  accept,
  maxSize,
  maxFiles,
  onReject,
  pickFiles,
}: FileSelectionProps) {
  const [files, setFiles] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })

  const add = (incoming: PickedFile[]) => {
    const rejections: FileRejection[] = []
    const accepted: PickedFile[] = []
    for (const file of incoming) {
      if (!matchesAccept(file, accept)) rejections.push({ file, reason: 'type' })
      else if (maxSize != null && file.size != null && file.size > maxSize) {
        rejections.push({ file, reason: 'size' })
      } else accepted.push(file)
    }
    const limit = multiple ? (maxFiles ?? Infinity) : 1
    const combined = multiple ? [...files, ...accepted] : accepted
    for (const file of combined.slice(limit)) rejections.push({ file, reason: 'count' })
    if (accepted.length) setFiles(combined.slice(0, limit))
    if (rejections.length) onReject?.(rejections)
  }

  const browser = useBrowserFilePicker({ accept, multiple, onFiles: add })
  const picker = pickFiles ?? (isWeb ? undefined : getFilePicker())
  const canPick = Boolean(picker || browser.open)
  // A missing native picker is a setup mistake; say so once instead of silently disabling.
  useEffect(() => {
    if (canPick || warned) return
    warned = true
    console.warn(
      'File Upload: no file picker on this platform. Call setFilePicker() at app start ' +
        '(e.g. with expo-document-picker) or pass pickFiles.',
    )
  }, [canPick])

  const open = async () => {
    if (picker) {
      const picked = await picker({ multiple, accept })
      if (picked?.length) add(picked)
    } else browser.open?.()
  }

  const remove = (index: number) => setFiles(files.filter((_, i) => i !== index))

  return { files, add, remove, open, canPick, inputElement: browser.element }
}

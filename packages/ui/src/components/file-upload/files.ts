/** A picked file, the same shape on every platform. */
export interface PickedFile {
  name: string
  /** Bytes, when the picker reports it. */
  size?: number
  /** MIME type, e.g. `image/png`. */
  type?: string
  /** Native: the file's URI (upload it with `fetch` / `FormData`). */
  uri?: string
  /** Web: the browser `File`. */
  file?: File
}

export interface PickFilesOptions {
  multiple: boolean
  /** The `accept` of the component, e.g. `image/*,.pdf`. */
  accept?: string
}

/**
 * Opens the platform's file picker. Resolve with the picked files, or with an
 * empty array / null when the user cancels.
 */
export type PickFiles = (options: PickFilesOptions) => Promise<PickedFile[] | null | undefined>

export type FileRejectReason = 'type' | 'size' | 'count'

export interface FileRejection {
  file: PickedFile
  reason: FileRejectReason
}

// Set once at app start; a module value (not context) so it also reaches
// uploads inside native portals (sheets, dialogs), which drop React context.
let appPicker: PickFiles | undefined

/**
 * Registers the app's native file picker for every File Upload and File
 * Dropzone, e.g. with `expo-document-picker`. Web needs none: it uses the
 * browser's file dialog.
 */
export function setFilePicker(pickFiles: PickFiles | undefined) {
  appPicker = pickFiles
}

export function getFilePicker() {
  return appPicker
}

export function fromBrowserFiles(list: FileList | File[]): PickedFile[] {
  return Array.from(list, (file) => ({ name: file.name, size: file.size, type: file.type, file }))
}

/** Whether a file matches an `accept` string (`image/*`, `.pdf`, `application/json`). */
export function matchesAccept(file: PickedFile, accept?: string) {
  if (!accept) return true
  const name = file.name.toLowerCase()
  const type = (file.type ?? '').toLowerCase()
  return accept
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) =>
      rule.startsWith('.')
        ? name.endsWith(rule)
        : rule.endsWith('/*')
          ? type.startsWith(rule.slice(0, -1))
          : type === rule,
    )
}

/** "12 KB", "3.4 MB". */
export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`
}

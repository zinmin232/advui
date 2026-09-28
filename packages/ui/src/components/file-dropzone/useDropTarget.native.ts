import type { RefObject } from 'react'
import type { PickedFile } from '../file-upload/files'

/** Native has no drag and drop; the zone is a large button that opens the picker. */
export function useDropTarget(
  _ref: RefObject<unknown>,
  _options: { onFiles: (files: PickedFile[]) => void; disabled: boolean },
) {
  return false
}

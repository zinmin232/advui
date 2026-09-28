import { type RefObject, useEffect, useRef, useState } from 'react'
import { type PickedFile, fromBrowserFiles } from '../file-upload/files'

/** Web: files dragged onto the element. Returns whether files are over it. */
export function useDropTarget(
  ref: RefObject<unknown>,
  { onFiles, disabled }: { onFiles: (files: PickedFile[]) => void; disabled: boolean },
) {
  const [dragging, setDragging] = useState(false)
  // The latest callback, without re-binding listeners (and losing the drag) on each render.
  const latest = useRef(onFiles)
  useEffect(() => {
    latest.current = onFiles
  })

  useEffect(() => {
    const node = ref.current as HTMLElement | null
    if (!node || disabled) return
    // dragenter / dragleave also fire for children; count them.
    let depth = 0
    const hasFiles = (event: DragEvent) => event.dataTransfer?.types.includes('Files') ?? false
    const onEnter = (event: DragEvent) => {
      if (!hasFiles(event)) return
      event.preventDefault()
      depth++
      setDragging(true)
    }
    const onOver = (event: DragEvent) => {
      // Required for the element to accept the drop.
      if (hasFiles(event)) event.preventDefault()
    }
    const onLeave = () => {
      depth = Math.max(0, depth - 1)
      if (depth === 0) setDragging(false)
    }
    const onDrop = (event: DragEvent) => {
      event.preventDefault()
      depth = 0
      setDragging(false)
      const files = event.dataTransfer?.files
      if (files?.length) latest.current(fromBrowserFiles(files))
    }
    node.addEventListener('dragenter', onEnter)
    node.addEventListener('dragover', onOver)
    node.addEventListener('dragleave', onLeave)
    node.addEventListener('drop', onDrop)
    return () => {
      node.removeEventListener('dragenter', onEnter)
      node.removeEventListener('dragover', onOver)
      node.removeEventListener('dragleave', onLeave)
      node.removeEventListener('drop', onDrop)
    }
  }, [ref, disabled])

  return dragging
}

import { FileDropzone, type PickedFile } from '@advui/core'
import { useState } from 'react'

export default function FileDropzoneBasic() {
  const [files, setFiles] = useState<PickedFile[]>([
    { name: 'quarterly-report.pdf', size: 2_450_000, type: 'application/pdf' },
  ])
  return (
    <FileDropzone
      accept="image/*,.pdf"
      maxSize={10_000_000}
      description="Images or PDFs, up to 10 MB each"
      value={files}
      onValueChange={setFiles}
      width="100%"
      maxWidth={480}
    />
  )
}

import { FileUpload, Field, type PickedFile } from '@advui/core'
import { useState } from 'react'

const photos: PickedFile[] = [
  { name: 'kitchen.jpg', size: 1_840_000, type: 'image/jpeg' },
  { name: 'living-room.png', size: 3_200_000, type: 'image/png' },
]

export default function FileUploadMultiple() {
  const [files, setFiles] = useState(photos)
  const [error, setError] = useState<string>()
  return (
    <Field
      label="Photos"
      description="Up to 4 images, 5 MB each."
      error={error}
      width="100%"
      maxWidth={360}
    >
      <FileUpload
        multiple
        accept="image/*"
        maxSize={5_000_000}
        maxFiles={4}
        value={files}
        onValueChange={(next) => {
          setFiles(next)
          setError(undefined)
        }}
        onReject={(rejections) =>
          setError(
            `${rejections.map((r) => r.file.name).join(', ')}: not added (${rejections[0]!.reason}).`,
          )
        }
      />
    </Field>
  )
}

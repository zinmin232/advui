import { FileUpload, FormField } from '@advui/core'

export default function FileUploadBasic() {
  return (
    <FormField label="Résumé" description="PDF, up to 5 MB." width="100%" maxWidth={360}>
      <FileUpload accept=".pdf" maxSize={5_000_000} />
    </FormField>
  )
}

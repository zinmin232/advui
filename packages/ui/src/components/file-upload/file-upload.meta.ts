import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'File Upload',
  slug: 'file-upload',
  category: 'advanced',
  description: 'A button that opens the file picker, with the picked files listed below.',
  status: 'beta',
  since: '0.5.0',
  platforms: ['web', 'ios', 'android'],
  exports: [
    'FileUpload',
    'setFilePicker',
    'formatBytes',
    'PickedFile',
    'PickFiles',
    'PickFilesOptions',
    'FileRejection',
    'FileRejectReason',
  ],
  files: [
    'components/file-upload/FileUpload.tsx',
    'components/file-upload/FileList.tsx',
    'components/file-upload/files.ts',
    'components/file-upload/useFileSelection.ts',
    'components/file-upload/useBrowserFilePicker.tsx',
    'components/file-upload/useBrowserFilePicker.native.tsx',
    'components/file-upload/index.ts',
  ],
  keywords: ['file', 'upload', 'attachment', 'document', 'picker', 'input file'],
  usage: `import { FileUpload, Field, setFilePicker } from '@advui/core'
import * as DocumentPicker from 'expo-document-picker'

// Once, at app start (iOS / Android; web uses the browser's dialog):
setFilePicker(async ({ multiple, accept }) => {
  const result = await DocumentPicker.getDocumentAsync({
    multiple,
    type: accept?.split(',') ?? '*/*',
  })
  return result.canceled
    ? null
    : result.assets.map((a) => ({ name: a.name, size: a.size, type: a.mimeType, uri: a.uri }))
})

<Field label="Résumé" description="PDF, up to 5 MB.">
  <FileUpload accept=".pdf" maxSize={5_000_000} onValueChange={setFiles} />
</Field>`,
  parts: [
    {
      name: 'FileUpload',
      props: [
        {
          name: 'value',
          type: 'PickedFile[]',
          description: '`{ name, size?, type?, uri? (native), file? (web File) }`.',
        },
        {
          name: 'defaultValue',
          type: 'PickedFile[]',
          description: 'Starting `value` when uncontrolled.',
        },
        {
          name: 'onValueChange',
          type: '(files: PickedFile[]) => void',
          description: 'Called when files are picked or removed.',
        },
        {
          name: 'multiple',
          type: 'boolean',
          default: 'false',
          description: 'Keep several files; otherwise a new pick replaces the file.',
        },
        {
          name: 'accept',
          type: 'string',
          description: 'Allowed types, as in `<input accept>`: `image/*,.pdf`.',
        },
        { name: 'maxSize', type: 'number', description: 'Largest allowed file, in bytes.' },
        { name: 'maxFiles', type: 'number', description: 'Most files kept when `multiple`.' },
        {
          name: 'onReject',
          type: "({ file, reason: 'type' | 'size' | 'count' })[] => void",
          description: 'Files that were refused; show the reason with a Field’s `error`.',
        },
        {
          name: 'pickFiles',
          type: '({ multiple, accept }) => Promise<PickedFile[] | null>',
          description:
            'This upload’s picker. Defaults to the browser on web and `setFilePicker` on native.',
        },
        {
          name: 'buttonLabel',
          type: 'string',
          default: "'Choose file'",
          description: 'The button text (“Choose files” with `multiple`).',
        },
        {
          name: 'emptyText',
          type: 'string',
          default: "'No file chosen'",
          description: 'Shown while no file is chosen (“No files chosen” with `multiple`).',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          options: ['sm', 'md', 'lg'],
          default: "'md'",
          description: 'Button size.',
        },
        {
          name: 'invalid',
          type: 'boolean',
          default: 'false',
          description: 'Error styling and `aria-invalid`.',
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description: 'Not focusable or editable.',
        },
      ],
      children: { accepts: 'none' },
    },
  ],
  examples: [
    { name: 'basic', title: 'Basic' },
    { name: 'multiple', title: 'Several images with limits' },
  ],
  accessibility: [
    'The control is a real button; a Field’s label names it, and help or error text describes it.',
    'The picked files are a list; each has a remove button named "Remove {file name}".',
    'Refused files are reported through `onReject`, so the reason can be shown as text.',
  ],
  keyboard: [{ keys: 'Enter / Space', action: 'Opens the file picker.' }],
  platformNotes: {
    web: 'Uses a hidden `<input type="file">`, so the browser’s own dialog and `accept` filtering apply.',
    ios: 'Uses the picker from `setFilePicker` (e.g. `expo-document-picker`); without one the button is disabled and a warning is logged in development.',
    android: 'Uses the picker from `setFilePicker` (e.g. `expo-document-picker`).',
  },
  related: ['file-dropzone', 'field'],
})

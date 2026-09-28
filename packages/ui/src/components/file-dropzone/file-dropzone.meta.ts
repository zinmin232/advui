import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'File Dropzone',
  slug: 'file-dropzone',
  category: 'advanced',
  description:
    'A large area to drop files on (web) or tap to pick them, with the files listed below.',
  status: 'beta',
  since: '0.5.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['FileDropzone'],
  files: [
    'components/file-dropzone/FileDropzone.tsx',
    'components/file-dropzone/useDropTarget.ts',
    'components/file-dropzone/useDropTarget.native.ts',
    'components/file-dropzone/index.ts',
    'components/file-upload/FileList.tsx',
    'components/file-upload/files.ts',
    'components/file-upload/useFileSelection.ts',
    'components/file-upload/useBrowserFilePicker.tsx',
    'components/file-upload/useBrowserFilePicker.native.tsx',
  ],
  keywords: ['dropzone', 'drag and drop', 'upload', 'files', 'attachments'],
  usage: `import { FileDropzone } from '@advui/core'

<FileDropzone
  accept="image/*,.pdf"
  maxSize={10_000_000}
  description="Images or PDFs, up to 10 MB each"
  onValueChange={setFiles}
/>`,
  parts: [
    {
      name: 'FileDropzone',
      description:
        'Takes File Upload’s `value`, `onValueChange`, `accept`, `maxSize`, `maxFiles`, `onReject` and `pickFiles`.',
      props: [
        {
          name: 'multiple',
          type: 'boolean',
          default: 'true',
          description: 'Keep several files (the default for a dropzone).',
        },
        {
          name: 'title',
          type: 'ReactNode',
          default: "'Drop files here or click to browse' / 'Tap to choose files'",
          description: 'Main line; also the accessible name.',
        },
        {
          name: 'description',
          type: 'ReactNode',
          description: 'Second line, e.g. allowed types and size.',
        },
        { name: 'invalid / disabled', type: 'boolean', default: 'false', description: 'States.' },
      ],
    },
  ],
  examples: [{ name: 'basic', title: 'Basic' }],
  accessibility: [
    'The zone is one button named by its text, so keyboard and screen-reader users open the picker instead of dragging.',
    'Dropped files are checked against `accept`, `maxSize` and `maxFiles` like picked ones.',
    'The picked files are a list with named remove buttons.',
  ],
  keyboard: [{ keys: 'Enter / Space', action: 'Opens the file picker.' }],
  platformNotes: {
    web: 'Files dragged over the zone highlight it; dropping adds them.',
    ios: 'No drag and drop: the zone is a large button that opens the picker from `setFilePicker`.',
    android:
      'No drag and drop: the zone is a large button that opens the picker from `setFilePicker`.',
  },
  related: ['file-upload'],
})

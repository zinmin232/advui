import { IconDefaults, UploadIcon } from '@advui/icons'
import { type ReactNode, forwardRef, useRef } from 'react'
import { type GetProps, type TamaguiElement, View, isWeb, styled } from 'tamagui'
import { FileList } from '../file-upload/FileList'
import { type FileSelectionProps, useFileSelection } from '../file-upload/useFileSelection'
import { Text } from '../typography/Text'
import { useDropTarget } from './useDropTarget'

const DropArea = styled(View, {
  name: 'FileDropzone',
  role: 'button',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$2',
  paddingVertical: '$8',
  paddingHorizontal: '$6',
  borderWidth: 1,
  borderStyle: 'dashed',
  borderColor: '$borderStrong',
  borderRadius: '$lg',
  backgroundColor: '$background',
  cursor: 'pointer',
  hoverStyle: { backgroundColor: '$muted' },
  pressStyle: { backgroundColor: '$muted' },
  focusVisibleStyle: {
    outlineColor: '$ring',
    outlineStyle: 'solid',
    outlineWidth: 2,
    outlineOffset: 2,
  },

  variants: {
    dragging: {
      true: {
        borderColor: '$ring',
        borderStyle: 'solid',
        backgroundColor: '$accent',
        hoverStyle: { backgroundColor: '$accent' },
      },
    },
    invalid: { true: { borderColor: '$error' } },
    disabled: {
      true: {
        opacity: 0.5,
        cursor: 'not-allowed',
        hoverStyle: { backgroundColor: '$background' },
        pressStyle: { backgroundColor: '$background' },
      },
    },
  } as const,
})

export interface FileDropzoneProps
  extends Omit<GetProps<typeof DropArea>, 'children' | 'defaultValue'>, FileSelectionProps {
  /** Main line. Default: "Drop files here or click to browse" (web), "Tap to choose files" (native). */
  title?: ReactNode
  /** Second line, e.g. allowed types and size. */
  description?: ReactNode
  /** Accessible name of each remove button. */
  removeLabel?: (name: string) => string
  disabled?: boolean
  invalid?: boolean
}

/**
 * A large area to drop files on (web) or tap to pick them, with the picked
 * files listed below. It is one button: Enter or Space opens the picker, and
 * its text is its accessible name.
 */
export const FileDropzone = forwardRef<TamaguiElement, FileDropzoneProps>(function FileDropzone(
  {
    value,
    defaultValue,
    onValueChange,
    multiple = true,
    accept,
    maxSize,
    maxFiles,
    onReject,
    pickFiles,
    title,
    description,
    removeLabel = (name) => `Remove ${name}`,
    disabled = false,
    invalid = false,
    ...props
  },
  ref,
) {
  const areaRef = useRef<TamaguiElement>(null)
  const { files, add, remove, open, canPick, inputElement } = useFileSelection({
    value,
    defaultValue,
    onValueChange,
    multiple,
    accept,
    maxSize,
    maxFiles,
    onReject,
    pickFiles,
  })
  const inactive = disabled || !canPick
  const dragging = useDropTarget(areaRef, { onFiles: add, disabled })
  const defaultTitle = isWeb
    ? `Drop ${multiple ? 'files' : 'a file'} here or click to browse`
    : `Tap to choose ${multiple ? 'files' : 'a file'}`

  return (
    <View gap="$3" alignSelf="stretch">
      {inputElement}
      <DropArea
        ref={(node: TamaguiElement | null) => {
          areaRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        dragging={dragging}
        invalid={invalid}
        disabled={inactive}
        aria-disabled={inactive || undefined}
        aria-invalid={invalid || undefined}
        // Native views with a role need `accessible` to be announced.
        {...(isWeb
          ? {
              tabIndex: inactive ? -1 : 0,
              onKeyDown: (event: { key: string; preventDefault: () => void }) => {
                if (inactive || (event.key !== 'Enter' && event.key !== ' ')) return
                event.preventDefault()
                void open()
              },
            }
          : { accessible: true })}
        onPress={inactive ? undefined : () => void open()}
        {...props}
      >
        <View backgroundColor="$muted" borderRadius="$full" padding="$3" aria-hidden>
          <IconDefaults size={20} color="$mutedForeground">
            <UploadIcon />
          </IconDefaults>
        </View>
        <Text size="sm" weight="semibold" textAlign="center">
          {title ?? defaultTitle}
        </Text>
        {description ? (
          <Text size="xs" tone="muted" textAlign="center">
            {description}
          </Text>
        ) : null}
      </DropArea>
      {files.length ? (
        <FileList files={files} onRemove={remove} removeLabel={removeLabel} disabled={disabled} />
      ) : null}
    </View>
  )
})

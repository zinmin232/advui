import { UploadIcon } from '@advui/icons'
import { forwardRef } from 'react'
import { type GetProps, type TamaguiElement, View, styled } from 'tamagui'
import { useFieldControl } from '../../hooks/useFieldControl'
import { Button } from '../button/Button'
import { Text } from '../typography/Text'
import { FileList } from './FileList'
import { type FileSelectionProps, useFileSelection } from './useFileSelection'

const FileUploadFrame = styled(View, {
  name: 'FileUpload',
  gap: '$2',
  alignItems: 'flex-start',
})

export interface FileUploadProps
  extends Omit<GetProps<typeof FileUploadFrame>, 'children' | 'defaultValue'>, FileSelectionProps {
  /** Text of the button. */
  buttonLabel?: string
  /** Shown while no file is picked. */
  emptyText?: string
  /** Accessible name of each remove button. */
  removeLabel?: (name: string) => string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  invalid?: boolean
  'aria-describedby'?: string
  'aria-required'?: boolean
}

/**
 * A button that opens the file picker, with the picked files listed below.
 * Web uses the browser's dialog; iOS and Android use the app's picker from
 * `setFilePicker` (or `pickFiles`).
 */
export const FileUpload = forwardRef<TamaguiElement, FileUploadProps>(
  function FileUpload(uploadProps, ref) {
    const {
      value,
      defaultValue,
      onValueChange,
      multiple = false,
      accept,
      maxSize,
      maxFiles,
      onReject,
      pickFiles,
      buttonLabel = multiple ? 'Choose files' : 'Choose file',
      emptyText = multiple ? 'No files chosen' : 'No file chosen',
      removeLabel = (name: string) => `Remove ${name}`,
      size = 'md',
      disabled = false,
      invalid = false,
      id,
      'aria-label': ariaLabel,
      'aria-describedby': describedBy,
      'aria-required': required,
      ...props
    } = useFieldControl(uploadProps)
    const { files, remove, open, canPick, inputElement } = useFileSelection({
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

    return (
      <FileUploadFrame ref={ref} {...props}>
        {inputElement}
        <Button
          id={id}
          variant="outline"
          size={size}
          icon={<UploadIcon />}
          disabled={disabled || !canPick}
          aria-label={ariaLabel}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          aria-required={required}
          {...(invalid && { borderColor: '$error' })}
          onPress={open}
        >
          {buttonLabel}
        </Button>
        {files.length ? (
          <View alignSelf="stretch">
            <FileList
              files={files}
              onRemove={remove}
              removeLabel={removeLabel}
              disabled={disabled}
            />
          </View>
        ) : (
          <Text size="sm" tone="muted">
            {emptyText}
          </Text>
        )}
      </FileUploadFrame>
    )
  },
)

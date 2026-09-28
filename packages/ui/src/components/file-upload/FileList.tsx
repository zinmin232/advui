import { FileIcon, IconDefaults, XIcon } from '@advui/icons'
import { View, XStack } from 'tamagui'
import { IconButton } from '../icon-button/IconButton'
import { Text } from '../typography/Text'
import { type PickedFile, formatBytes } from './files'

/** The picked files, each with its size and a named remove button. */
export function FileList({
  files,
  onRemove,
  removeLabel,
  disabled,
}: {
  files: PickedFile[]
  onRemove: (index: number) => void
  removeLabel: (name: string) => string
  disabled?: boolean
}) {
  return (
    <View role="list" gap="$1.5">
      {files.map((file, index) => (
        <XStack
          key={`${file.name}-${index}`}
          role="listitem"
          alignItems="center"
          gap="$2.5"
          paddingLeft="$3"
          paddingRight="$1"
          paddingVertical="$1"
          borderWidth={1}
          borderColor="$border"
          borderRadius="$md"
          backgroundColor="$card"
        >
          <IconDefaults size={16} color="$mutedForeground">
            <FileIcon />
          </IconDefaults>
          <View flex={1} minWidth={0}>
            <Text size="sm" numberOfLines={1}>
              {file.name}
            </Text>
            {file.size != null ? (
              <Text size="xs" tone="muted">
                {formatBytes(file.size)}
              </Text>
            ) : null}
          </View>
          <IconButton
            size="sm"
            icon={<XIcon />}
            aria-label={removeLabel(file.name)}
            disabled={disabled}
            onPress={() => onRemove(index)}
          />
        </XStack>
      ))}
    </View>
  )
}

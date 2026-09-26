'use client'

import { HStack, IconButton, Text, Tooltip } from '@advui/core'
import { CheckIcon, CopyIcon } from '@advui/icons'
import { useState } from 'react'
import { View } from 'tamagui'

export function CopyButton({ value, label = 'Copy code' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Tooltip content={copied ? 'Copied!' : label}>
      <IconButton
        aria-label={copied ? 'Copied' : label}
        size="sm"
        icon={copied ? <CheckIcon /> : <CopyIcon />}
        onPress={async () => {
          await navigator.clipboard.writeText(value)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        }}
      />
    </Tooltip>
  )
}

/** Renders pre-highlighted Shiki HTML (produced on the server) with a copy button. */
export function CodeBlock({
  html,
  code,
  title,
  maxHeight,
}: {
  html: string
  code: string
  title?: string
  maxHeight?: number
}) {
  return (
    <View
      borderWidth={1}
      borderColor="$border"
      borderRadius="$lg"
      backgroundColor="$muted"
      overflow="hidden"
    >
      <HStack
        justifyContent="space-between"
        paddingLeft="$4"
        paddingRight="$1.5"
        height="$10"
        borderBottomWidth={title ? 1 : 0}
        borderColor="$border"
        position={title ? 'relative' : 'absolute'}
        right={0}
        top={0}
        zIndex={1}
      >
        {title ? (
          <Text size="xs" tone="muted" mono>
            {title}
          </Text>
        ) : (
          <View />
        )}
        <CopyButton value={code} />
      </HStack>
      <div
        className="code-block"
        style={maxHeight ? { maxHeight, overflow: 'auto' } : undefined}
        // Shiki output is generated at build time from repository files.
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </View>
  )
}

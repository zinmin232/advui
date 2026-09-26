'use client'

import { View } from 'tamagui'
import { ExampleRenderer } from '../../../../components/component-preview'

export function PreviewFrame({ slug, name }: { slug: string; name: string }) {
  return (
    <View
      render="main"
      minHeight="100vh"
      padding="$4"
      alignItems="center"
      justifyContent="center"
      backgroundColor="$background"
    >
      <View width="100%" alignItems="center">
        <ExampleRenderer slug={slug} name={name} />
      </View>
    </View>
  )
}

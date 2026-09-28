import { ChevronLeftIcon, ChevronRightIcon, XIcon } from '@advui/icons'
import { useEffect, useRef } from 'react'
import { View, XStack, isWeb } from 'tamagui'
import { useControllableState } from '../../hooks/useControllableState'
import { useRipple } from '../../hooks/useRipple'
import { Dialog } from '../dialog/Dialog'
import { IconButton } from '../icon-button/IconButton'
import { Image } from '../image/Image'
import { Grid, type ResponsiveColumns } from '../layout/Grid'
import { Text } from '../typography/Text'

export interface GalleryImage {
  /** Full-size image: URL or `require()`. */
  src: string | number
  /** What the image shows. Names the thumbnail button and the viewer. */
  alt: string
  caption?: string
  /** Smaller image for the grid. Default: `src`. */
  thumbnail?: string | number
}

export interface ImageGalleryLabels {
  /** Name of a thumbnail button. Default: "View {alt}". */
  open: (image: GalleryImage, index: number) => string
  previous: string
  next: string
  close: string
  /** Position in the viewer. Default: "3 of 12". */
  position: (index: number, count: number) => string
}

const defaultLabels: ImageGalleryLabels = {
  open: (image) => `View ${image.alt}`,
  previous: 'Previous image',
  next: 'Next image',
  close: 'Close',
  position: (index, count) => `${index + 1} of ${count}`,
}

export interface ImageGalleryProps {
  images: GalleryImage[]
  /** Thumbnails per row, or a mobile-first map. Default: `{ base: 2, sm: 3 }`. */
  columns?: ResponsiveColumns
  /** Thumbnail shape, width / height. Default: 1 (square). */
  ratio?: number
  /** Open image in the viewer (controlled); `null` when closed. */
  index?: number | null
  defaultIndex?: number | null
  onIndexChange?: (index: number | null) => void
  /** Button names and the position text, for translation. */
  labels?: Partial<ImageGalleryLabels>
}

function Thumbnail({
  image,
  label,
  ratio,
  onPress,
}: {
  image: GalleryImage
  label: string
  ratio: number
  onPress: () => void
}) {
  const ripple = useRipple({ color: '$foreground' })
  return (
    <View
      {...(isWeb
        ? { render: 'button', type: 'button', padding: 0, borderWidth: 0 }
        : { accessible: true, role: 'button' })}
      aria-label={label}
      borderRadius="$md"
      overflow="hidden"
      backgroundColor="transparent"
      cursor="pointer"
      hoverStyle={{ opacity: 0.9 }}
      pressStyle={{ opacity: 0.8 }}
      focusVisibleStyle={{
        outlineColor: '$ring',
        outlineStyle: 'solid',
        outlineWidth: 2,
        outlineOffset: 2,
      }}
      onPress={onPress}
      {...ripple.props}
    >
      {ripple.element}
      {/* The button carries the name; the picture itself is decoration here. */}
      <Image src={image.thumbnail ?? image.src} alt="" ratio={ratio} width="100%" />
    </View>
  )
}

/**
 * A grid of thumbnails that open a full-screen viewer with previous and
 * next buttons (and the arrow keys on web).
 */
export function ImageGallery({
  images,
  columns = { base: 2, sm: 3 },
  ratio = 1,
  index: indexProp,
  defaultIndex = null,
  onIndexChange,
  labels: labelsProp,
}: ImageGalleryProps) {
  const labels = { ...defaultLabels, ...labelsProp }
  const [index, setIndex] = useControllableState<number | null>({
    value: indexProp,
    defaultValue: defaultIndex,
    onChange: onIndexChange,
  })
  const count = images.length
  const current = index != null && index >= 0 && index < count ? index : null
  const image = current != null ? images[current] : undefined

  const go = (step: 1 | -1) => {
    if (current == null) return
    const next = current + step
    if (next >= 0 && next < count) setIndex(next)
  }

  // Web: the arrow keys page through the open viewer.
  const goRef = useRef(go)
  goRef.current = go
  useEffect(() => {
    if (!isWeb || current == null) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') goRef.current(-1)
      else if (event.key === 'ArrowRight') goRef.current(1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [current])

  return (
    <>
      <Grid columns={columns} gap="$2" width="100%">
        {images.map((item, i) => (
          <Thumbnail
            key={`${String(item.src)}-${i}`}
            image={item}
            label={labels.open(item, i)}
            ratio={ratio}
            onPress={() => setIndex(i)}
          />
        ))}
      </Grid>
      <Dialog open={image != null} onOpenChange={(open) => !open && setIndex(null)}>
        {image ? (
          <Dialog.Content size="xl" hideCloseButton gap="$3">
            <XStack alignItems="center" gap="$2">
              <View flex={1} minWidth={0}>
                <Dialog.Title fontSize="$3" lineHeight="$3" numberOfLines={1}>
                  {image.alt}
                </Dialog.Title>
                <Text size="xs" tone="muted" aria-live="polite">
                  {labels.position(current!, count)}
                </Text>
              </View>
              <Dialog.Close asChild>
                <IconButton size="sm" aria-label={labels.close} icon={<XIcon />} />
              </Dialog.Close>
            </XStack>
            <Image
              key={String(image.src)}
              src={image.src}
              alt={image.alt}
              fit="contain"
              width="100%"
              // A set height keeps the caption and buttons on screen, whatever the photo's shape.
              height="$96"
              $max-sm={{ height: '$64' }}
              borderRadius="$md"
            />
            {image.caption ? <Dialog.Description>{image.caption}</Dialog.Description> : null}
            <XStack justifyContent="space-between" alignItems="center">
              <IconButton
                variant="outline"
                aria-label={labels.previous}
                icon={<ChevronLeftIcon />}
                disabled={current === 0}
                onPress={() => go(-1)}
              />
              <IconButton
                variant="outline"
                aria-label={labels.next}
                icon={<ChevronRightIcon />}
                disabled={current === count - 1}
                onPress={() => go(1)}
              />
            </XStack>
          </Dialog.Content>
        ) : null}
      </Dialog>
    </>
  )
}

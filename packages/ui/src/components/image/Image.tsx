import { IconDefaults, ImageIcon } from '@advui/icons'
import {
  type ComponentProps,
  type ComponentType,
  type ReactNode,
  type Ref,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  type GetProps,
  Image as TamaguiImage,
  type TamaguiElement,
  View,
  isWeb,
  styled,
  useEvent,
} from 'tamagui'

type Status = 'loading' | 'loaded' | 'error'

// Typed as a plain function component, but it forwards its ref (the <img> on web).
const ImageElement = TamaguiImage as unknown as ComponentType<
  ComponentProps<typeof TamaguiImage> & { ref?: Ref<HTMLImageElement> }
>

const ImageFrame = styled(View, {
  name: 'Image',
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: '$muted',

  variants: {
    loaded: {
      true: { backgroundColor: 'transparent' },
    },
  } as const,
})

export interface ImageProps extends Omit<GetProps<typeof ImageFrame>, 'children' | 'loaded'> {
  /** URL, or the result of `require()` for a bundled image on native. */
  src: string | number
  /**
   * What the image shows, for screen readers. Pass `""` when it is only
   * decoration or the text next to it already says it.
   */
  alt: string
  /** Width divided by height, e.g. `16 / 9`. Without it, give the image a height. */
  ratio?: number
  /** How the picture fills the box. */
  fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  /** Shown when the image fails to load. Default: an image icon on the muted surface. */
  fallback?: ReactNode
  /** Web: `lazy` waits until the image is near the viewport. */
  loading?: 'lazy' | 'eager'
  onLoad?: () => void
  onError?: () => void
}

/**
 * A picture in a box of a set size or ratio. The box shows a muted
 * placeholder while the image loads and a fallback if it fails.
 */
export const Image = forwardRef<TamaguiElement, ImageProps>(function Image(
  { src, alt, ratio, fit = 'cover', fallback, loading, onLoad, onError, ...props },
  ref,
) {
  // Keyed by `src`, so a new source starts loading again without an effect.
  const [state, setState] = useState<{ src: string | number; status: Status }>({
    src,
    status: 'loading',
  })
  const status = state.src === src ? state.status : 'loading'
  // A cached image can report through both the element check below and its
  // load event: settle each source once.
  const settled = useRef<string | number | null>(null)
  const settle = useEvent((next: Status) => {
    if (settled.current === src) return
    settled.current = src
    setState({ src, status: next })
    if (next === 'loaded') onLoad?.()
    else onError?.()
  })

  // On web the image can finish (or fail) before hydration attaches its
  // handlers, so read the result from the element once mounted.
  const imageRef = useRef<HTMLImageElement>(null)
  useEffect(() => {
    const image = imageRef.current
    if (!isWeb || !image?.complete || !image.src) return
    settle(image.naturalWidth > 0 ? 'loaded' : 'error')
  }, [src, settle])

  const failed = status === 'error'
  return (
    <ImageFrame
      ref={ref}
      loaded={status === 'loaded'}
      {...(ratio != null && { aspectRatio: ratio })}
      {...props}
    >
      {failed ? (
        <View
          position="absolute"
          top={0}
          right={0}
          bottom={0}
          left={0}
          alignItems="center"
          justifyContent="center"
          {...(alt
            ? { role: 'img', 'aria-label': alt, ...(!isWeb && { accessible: true }) }
            : { 'aria-hidden': true })}
        >
          {fallback ?? (
            <IconDefaults size={24} color="$mutedForeground">
              <ImageIcon />
            </IconDefaults>
          )}
        </View>
      ) : (
        <ImageElement
          // Remount for a new source, so its load state starts fresh.
          key={String(src)}
          ref={imageRef}
          // A `require()` number is valid on native; the merged types only allow URLs.
          src={src as string}
          objectFit={fit}
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          {...(isWeb
            ? { alt, loading }
            : // React Native makes an image with any `alt` (even "") accessible.
              alt
              ? { alt, role: 'img' }
              : { accessible: false, 'aria-hidden': true })}
          onLoad={() => settle('loaded')}
          onError={() => settle('error')}
        />
      )}
    </ImageFrame>
  )
})

import { forwardRef } from 'react'
import {
  Avatar as TamaguiAvatar,
  type GetProps,
  type TamaguiElement,
  Text,
  createStyledContext,
  isWeb,
  styled,
  withStaticProperties,
} from 'tamagui'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const AvatarContext = createStyledContext<{ size: AvatarSize }>({ size: 'md' })

const AvatarFrame = styled(TamaguiAvatar, {
  name: 'Avatar',
  context: AvatarContext,
  circular: true,
  overflow: 'hidden',
  flexShrink: 0,

  variants: {
    size: {
      xs: { width: '$6', height: '$6' },
      sm: { width: '$8', height: '$8' },
      md: { width: '$10', height: '$10' },
      lg: { width: '$12', height: '$12' },
      xl: { width: '$16', height: '$16' },
    },
    shape: {
      circle: { borderRadius: '$full' },
      square: { borderRadius: '$md' },
    },
  } as const,

  defaultVariants: { size: 'md', shape: 'circle' },
})

const AvatarImage = styled(TamaguiAvatar.Image, {
  name: 'AvatarImage',
  width: '100%',
  height: '100%',
})

const AvatarFallbackFrame = styled(TamaguiAvatar.Fallback, {
  name: 'AvatarFallback',
  backgroundColor: '$muted',
  alignItems: 'center',
  justifyContent: 'center',
})

const AvatarFallbackText = styled(Text, {
  name: 'AvatarFallbackText',
  context: AvatarContext,
  color: '$mutedForeground',
  fontFamily: '$body',
  fontWeight: '500',
  variants: {
    size: {
      xs: { fontSize: '$1' },
      sm: { fontSize: '$1' },
      md: { fontSize: '$2' },
      lg: { fontSize: '$3' },
      xl: { fontSize: '$5' },
    },
  } as const,
})

export type AvatarProps = Omit<GetProps<typeof AvatarFrame>, 'size'> & {
  size?: AvatarSize
  /** Image URL. The fallback shows until it loads, or if it fails. */
  src?: string
  /** Accessible description of the person or entity. */
  alt?: string
  /** Initials or short text shown when there is no image. Derived from `alt` when omitted. */
  fallback?: string
}

export function getInitials(name: string | undefined, max = 2): string {
  if (!name) return ''
  return name
    .trim()
    .split(/\s+/)
    .slice(0, max)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

const AvatarImpl = forwardRef<TamaguiElement, AvatarProps>(function Avatar(
  { src, alt, fallback, size = 'md', children, ...props },
  ref,
) {
  return (
    <AvatarFrame
      ref={ref}
      size={size}
      role="img"
      {...(isWeb || !alt ? null : { accessible: true })}
      aria-label={alt}
      {...props}
    >
      {children ?? (
        <>
          {src ? <AvatarImage src={src} alt={alt} aria-hidden /> : null}
          <AvatarFallbackFrame>
            <AvatarFallbackText aria-hidden>{fallback ?? getInitials(alt)}</AvatarFallbackText>
          </AvatarFallbackFrame>
        </>
      )}
    </AvatarFrame>
  )
})

/**
 * Profile image with an automatic initials fallback. Use the `src`/`fallback`
 * shorthand, or compose `Avatar.Image` + `Avatar.Fallback` for full control.
 */
export const Avatar = withStaticProperties(AvatarImpl, {
  Image: AvatarImage,
  Fallback: AvatarFallbackFrame,
  FallbackText: AvatarFallbackText,
})

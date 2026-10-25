import { ExternalLinkIcon } from '@advui/icons'
import { type CSSProperties, type ReactNode, forwardRef } from 'react'
import { type GestureResponderEvent, Linking } from 'react-native'
import {
  type GetProps,
  type TamaguiTextElement,
  Text as TamaguiText,
  isWeb,
  styled,
} from 'tamagui/unstyled'
import { type TextSize, textSizes, textWeights } from '../typography/Text'
import { VisuallyHidden } from '../visually-hidden/VisuallyHidden'

export type LinkTone = 'primary' | 'muted' | 'inherit'
export type LinkUnderline = 'always' | 'hover' | 'none'

export interface LinkLabels {
  /** Added to an external link's name on web, after its text. */
  external: string
}

const defaultLabels: LinkLabels = { external: '(opens in a new tab)' }

// Bundlers replace `process.env.NODE_ENV`; this types it for apps without Node's types.
declare const process: { env: { NODE_ENV?: string } }

/** A scheme such as `https:`, `mailto:` or `tel:`: iOS and Android can open it themselves. */
const ABSOLUTE_URL = /^[a-z][a-z\d+.-]*:/i

// The external icon follows the text size; without a size it suits body text.
const iconSizes: Record<TextSize, number> = {
  xs: 12,
  sm: 14,
  base: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 28,
  '5xl': 32,
  '6xl': 36,
}

// Warn once per path, not on every render.
const warnedPaths = new Set<string>()

const LinkText = styled(TamaguiText, {
  displayName: 'Link',
  cursor: 'pointer',
  // A link without an href renders a <button>: drop the browser's button chrome.
  padding: 0,
  borderWidth: 0,
  backgroundColor: 'transparent',
  outlineColor: 'focus-visible:ring',
  outlineStyle: 'focus-visible:solid',
  outlineWidth: 'focus-visible:2px',
  outlineOffset: 'focus-visible:2px',
  borderRadius: 'focus-visible:sm',
  variants: {
    tone: {
      primary: {
        color: 'primaryText',
      },
      muted: {
        color: 'mutedForeground hover:foreground',
      },
      // Takes the surrounding text's color, for links inside a sentence.
      inherit: {},
    },
    underline: {
      always: { textDecorationLine: 'underline' },
      hover: {
        textDecorationLine: 'none hover:underline focus-visible:underline',
      },
      none: { textDecorationLine: 'none' },
    },
    // No size means the size, font and line height of the surrounding text.
    size: textSizes,
    weight: textWeights,
    pressable: {
      true: {
        opacity: 'press:0.7',
      },
    },
  } as const,
})

type LinkTextProps = GetProps<typeof LinkText>

export interface LinkProps extends Omit<
  LinkTextProps,
  'children' | 'tone' | 'underline' | 'size' | 'pressable'
> {
  children: ReactNode
  /**
   * Where the link goes. On web it renders an `<a>`. On iOS and Android an
   * absolute URL (`https:`, `mailto:`, `tel:`) opens with the system; for a
   * path in your app, navigate in `onPress`.
   */
  href?: string
  /** Web: render your router's link instead of `<a>`, e.g. `render={<NextLink href="/docs" />}`. */
  render?: LinkTextProps['render']
  /** Opens in a new tab on web, with an icon that says so. */
  external?: boolean
  /** `primary` (default), `muted` for secondary links, or `inherit` for links inside colored text. */
  tone?: LinkTone
  /** `always` (default), `hover`, or `none`. Links inside running text should stay underlined. */
  underline?: LinkUnderline
  /** A step of the type scale. Leave it out to take the surrounding text's size. */
  size?: TextSize
  labels?: Partial<LinkLabels>
}

/**
 * A text link to another page, a section or an outside site. Works inside a
 * sentence (nested in Text) or on its own.
 */
export const Link = forwardRef<TamaguiTextElement, LinkProps>(function Link(
  {
    children,
    href,
    render,
    external = false,
    tone = 'primary',
    underline = 'always',
    size,
    weight,
    labels: labelsProp,
    onPress,
    ...props
  },
  ref,
) {
  const labels = { ...defaultLabels, ...labelsProp }
  const opensUrl = href !== undefined && ABSOLUTE_URL.test(href)
  // Native apps navigate with their router, so there a path only works with
  // onPress; without it the link would do nothing.
  const isLink = isWeb
    ? href !== undefined || render !== undefined || onPress !== undefined
    : onPress !== undefined || opensUrl

  if (
    process.env.NODE_ENV !== 'production' &&
    !isWeb &&
    !isLink &&
    href !== undefined &&
    !warnedPaths.has(href)
  ) {
    warnedPaths.add(href)
    console.warn(`Link: "${href}" needs onPress on iOS and Android, e.g. router.push("${href}").`)
  }

  const press = (event: GestureResponderEvent) => {
    onPress?.(event)
    // Web follows the <a> itself. Calling preventDefault in onPress stops both.
    if (!isWeb && opensUrl && !event?.isDefaultPrevented?.()) {
      // No app may handle the scheme (tel: on a tablet); there is nothing to show then.
      Linking.openURL(href).catch(() => {})
    }
  }

  const isButton = href === undefined && render === undefined
  // A <button> keeps the browser's font, color and alignment; take the text's, as an <a> does.
  const buttonStyle: CSSProperties = {
    fontFamily: 'inherit',
    letterSpacing: 'inherit',
    textAlign: 'inherit',
    ...(size === undefined && { fontSize: 'inherit', lineHeight: 'inherit' }),
    ...(weight === undefined && { fontWeight: 'inherit' }),
    ...(tone === 'inherit' && { color: 'inherit' }),
  }
  const semantics = isWeb
    ? {
        render: render ?? (isButton ? 'button' : 'a'),
        ...(href !== undefined && { href }),
        ...(isButton && { type: 'button', style: buttonStyle }),
        ...(external && { target: '_blank', rel: 'noopener noreferrer' }),
      }
    : {
        accessible: true,
        // TalkBack's double-tap on text arrives as the "activate" action.
        accessibilityActions: [{ name: 'activate' }],
        onAccessibilityAction: (event: { nativeEvent: { actionName: string } }) => {
          if (event.nativeEvent.actionName === 'activate') press(event as never)
        },
      }

  return (
    <LinkText
      ref={ref}
      // The unstyled Text has no color of its own, so `inherit` keeps the parent's.
      tone={tone}
      underline={underline}
      size={size}
      weight={weight}
      {...(isLink && { role: 'link', pressable: true, onPress: press, ...semantics })}
      {...props}
    >
      {children}
      {external ? (
        <>
          {/* Keeps the icon on the line of the last word. */}
          {'\u00A0'}
          <TamaguiText
            // Unstyled, so the icon's currentColor is the link's.
            {...(isWeb && { display: 'inline-flex', verticalAlign: 'middle' })}
            {...(!isWeb && { accessible: false })}
          >
            <ExternalLinkIcon
              size={size ? iconSizes[size] : 14}
              {...(!isWeb && tone !== 'inherit' && { color: color(tone) })}
            />
          </TamaguiText>
          {/* Text, not the icon's label: every browser puts text in the link's name. */}
          {isWeb ? <VisuallyHidden>{` ${labels.external}`}</VisuallyHidden> : null}
        </>
      ) : null}
    </LinkText>
  )
})

// Native icons do not inherit the text color.
function color(tone: Exclude<LinkTone, 'inherit'>) {
  return tone === 'primary' ? 'primaryText' : 'mutedForeground'
}

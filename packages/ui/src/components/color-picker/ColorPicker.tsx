import { ChevronDownIcon, PipetteIcon } from '@advui/icons'
import { type HSVA, fromHsv, toHex, withAlpha } from '@advui/utils'
import { forwardRef, useContext, useEffect, useRef, useState } from 'react'
import { type TamaguiElement, View, isWeb } from 'tamagui/unstyled'
import { useControllableState } from '../../hooks/useControllableState'
import { FieldContext, type FieldControlProps, useFieldControl } from '../../hooks/useFieldControl'
import { sentences } from '../../utils/plainText'
import { PickerTrigger, type PickerTriggerProps } from '../date-picker/PickerTrigger'
import { IconButton } from '../icon-button/IconButton'
import { Input } from '../input/Input'
import { Popover } from '../popover/Popover'
import { ChannelSlider } from './ChannelSlider'
import { Checkerboard } from './Checkerboard'
import { ColorArea } from './ColorArea'
import { BLACK, formatColor, hsvFrom, hueGradient, readColor } from './shared'
import { Swatch, SwatchButton } from './Swatch'

export interface ColorPickerLabels {
  /** Name of the saturation and brightness area. Default: "Color". */
  area: string
  /** What screen readers call the area, a slider in two directions. Default: "2D slider". */
  areaRole: string
  /** The area's value. Default: "Saturation 72%, brightness 40%". */
  areaValue: (saturation: number, brightness: number) => string
  /** iOS and Android: the actions that change the area's saturation. */
  saturate: string
  desaturate: string
  /** Default: "Hue". */
  hue: string
  /** The hue slider's value. Default: "200°". */
  hueValue: (degrees: number) => string
  /** Default: "Opacity". */
  alpha: string
  /** Name of the text field. Default: "Hex color". */
  input: string
  /** Name of the eyedropper button. Default: "Pick a color from the screen". */
  eyeDropper: string
  /** Name of the group of swatches. Default: "Swatches". */
  swatches: string
}

const defaultLabels: ColorPickerLabels = {
  area: 'Color',
  areaRole: '2D slider',
  areaValue: (saturation, brightness) => `Saturation ${saturation}%, brightness ${brightness}%`,
  saturate: 'More saturated',
  desaturate: 'Less saturated',
  hue: 'Hue',
  hueValue: (degrees) => `${degrees}°`,
  alpha: 'Opacity',
  input: 'Hex color',
  eyeDropper: 'Pick a color from the screen',
  swatches: 'Swatches',
}

/** A preset color: a color string, or one with a name for screen readers. */
export type ColorSwatch = string | { value: string; label: string }

export interface ColorPickerProps
  extends
    Omit<
      PickerTriggerProps,
      'valueText' | 'placeholder' | 'leading' | 'icon' | 'defaultValue' | 'children'
    >,
    FieldControlProps {
  /** The color, when you control it: hex, `rgb()` or `hsl()`. */
  value?: string
  /** Starting `value` when uncontrolled. Default: black. */
  defaultValue?: string
  /**
   * Called as the color changes, also while dragging, with `#rrggbb`, or
   * `#rrggbbaa` when `alpha` is on and the color is translucent.
   */
  onValueChange?: (value: string) => void
  /** Called when a drag ends, a key is pressed, a swatch is picked or the text is confirmed. */
  onValueCommit?: (value: string) => void
  /** Shows the opacity slider, and lets the value be translucent. */
  alpha?: boolean
  /** Preset colors below the field. */
  swatches?: ColorSwatch[]
  /** Shows the text field for typing a hex, `rgb()` or `hsl()` color. Default: true. */
  showInput?: boolean
  /** Web: shows a button that picks a color from the screen, where the browser supports it. Default: true. */
  eyeDropper?: boolean
  /** Shows the picker in the page instead of a field that opens it in a popover. */
  inline?: boolean
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Title of the popover, which names it for screen readers. Default: "Choose a color". */
  title?: string
  /** Names and value texts, to translate. */
  labels?: Partial<ColorPickerLabels>
  /** Web: the field name the color submits under in a native form. */
  name?: string
}

/**
 * Pick a color by dragging over saturation and brightness, sliding the hue
 * and opacity, typing it, or pressing a swatch. A field that opens a popover
 * (a bottom sheet on phones), or `inline` in the page.
 */
export const ColorPicker = forwardRef<TamaguiElement, ColorPickerProps>(
  function ColorPicker(pickerProps, ref) {
    const field = useContext(FieldContext)
    const {
      value: valueProp,
      defaultValue = BLACK,
      onValueChange,
      onValueCommit,
      alpha = false,
      swatches,
      showInput = true,
      eyeDropper = true,
      inline = false,
      open,
      defaultOpen = false,
      onOpenChange,
      title = 'Choose a color',
      labels: labelsProp,
      name,
      disabled = false,
      invalid = false,
      ...props
    } = useFieldControl(pickerProps)
    const labels = { ...defaultLabels, ...labelsProp }
    const [value, setValue] = useControllableState({
      value: valueProp,
      defaultValue,
      onChange: onValueChange,
    })
    const [isOpen, setOpen] = useControllableState({
      value: open,
      defaultValue: defaultOpen,
      onChange: onOpenChange,
    })

    // HSV keeps what a hex loses: the hue of a gray, the saturation of black.
    // `synced` is the value it last matched, passed in or sent out.
    const [state, setState] = useState(() => {
      const hsv = hsvFrom(value, { h: 0, s: 0, v: 0, a: 1 })
      return { hsv, synced: value }
    })
    let hsv = state.hsv
    if (value !== state.synced) {
      hsv = hsvFrom(value, state.hsv)
      setState({ hsv, synced: value })
    }
    if (!alpha) hsv = { ...hsv, a: 1 }
    const hex = formatColor(hsv, alpha)
    // The last color sent, for a commit at the end of a drag.
    const latest = useRef(hex)

    const update = (next: HSVA) => {
      const nextHex = formatColor(next, alpha)
      latest.current = nextHex
      setState({ hsv: next, synced: nextHex })
      setValue(nextHex)
    }
    const commit = () => onValueCommit?.(latest.current)
    /** A typed, picked or preset color. Returns false when it is not a color. */
    const apply = (color: string, keepAlpha = false) => {
      if (!readColor(color)) return false
      const next = hsvFrom(color, hsv)
      update(keepAlpha ? { ...next, a: hsv.a } : next)
      commit()
      return true
    }

    const panel = (
      <ColorPanel
        hsv={hsv}
        hex={hex}
        alpha={alpha}
        swatches={swatches}
        showInput={showInput}
        eyeDropper={eyeDropper}
        disabled={disabled}
        invalid={invalid}
        labels={labels}
        // Native has no group names: each control reads the field's label and help.
        hint={inline && !isWeb ? sentences(props['aria-label'], props.accessibilityHint) : undefined}
        onChange={update}
        onCommit={commit}
        onApply={apply}
      />
    )
    const hidden =
      isWeb && name ? <input type="hidden" name={name} value={hex} disabled={disabled} /> : null

    if (inline) {
      const {
        // aria-required is not allowed on a group. The Field's label still
        // shows the marker; say what is required in the help or error text.
        'aria-required': _ariaRequired,
        accessibilityHint: _hint,
        'aria-label': groupLabel,
        size: _size,
        ...frameProps
      } = props
      return (
        <View
          ref={ref}
          width="64"
          maxWidth="100%"
          opacity={disabled ? 0.5 : 1}
          {...(isWeb && {
                    role: 'group',
                    'aria-label': groupLabel,
                    // A <label for> cannot name a group, so a Field's label is linked by id.
                    ...(field?.labelId &&
                      groupLabel === undefined &&
                      props['aria-labelledby'] === undefined && { 'aria-labelledby': field.labelId }),
                  })}
          {...frameProps}
        >
          {panel}
          {hidden}
        </View>
      )
    }

    return (
      <>
        <Popover open={isOpen} onOpenChange={setOpen} align="start">
          <Popover.Trigger asChild>
            <PickerTrigger
              ref={ref}
              valueText={hex}
              placeholder={hex}
              leading={<Swatch color={hex} size="5" />}
              icon={<ChevronDownIcon />}
              disabled={disabled}
              invalid={invalid}
              {...props}
            />
          </Popover.Trigger>
          <Popover.Content>
            <Popover.Title>{title}</Popover.Title>
            {panel}
          </Popover.Content>
        </Popover>
        {hidden}
      </>
    )
  },
)

interface ColorPanelProps {
  hsv: HSVA
  hex: string
  alpha: boolean
  swatches: ColorSwatch[] | undefined
  showInput: boolean
  eyeDropper: boolean
  disabled: boolean
  invalid: boolean
  labels: ColorPickerLabels
  hint: string | undefined
  onChange: (hsv: HSVA) => void
  onCommit: () => void
  onApply: (color: string, keepAlpha?: boolean) => boolean
}

// A whole hex as it is typed, which can be shown before Enter.
const FULL_HEX = /^#?([0-9a-f]{6}|[0-9a-f]{8})$/i

type EyeDropperWindow = { EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> } }

function ColorPanel({
  hsv,
  hex,
  alpha,
  swatches = [],
  showInput,
  eyeDropper,
  disabled,
  invalid,
  labels,
  hint,
  onChange,
  onCommit,
  onApply,
}: ColorPanelProps) {
  // The text while it is being typed; null shows the color's hex.
  const [draft, setDraft] = useState<string | null>(null)
  // Only Chromium browsers have the EyeDropper API; check after hydration.
  const [canPick, setCanPick] = useState(false)
  useEffect(() => {
    setCanPick(isWeb && eyeDropper && typeof (window as EyeDropperWindow).EyeDropper === 'function')
  }, [eyeDropper])

  const opaque = fromHsv({ ...hsv, a: 1 })
  const items = swatches.flatMap((swatch) => {
    const color = typeof swatch === 'string' ? swatch : swatch.value
    const rgba = readColor(color)
    if (!rgba) return []
    const normalized = toHex(alpha ? rgba : { ...rgba, a: 1 })
    return [{ color: normalized, label: typeof swatch === 'string' ? color : swatch.label }]
  })

  const finishTyping = () => {
    if (draft === null) return
    onApply(draft)
    setDraft(null)
  }

  const pickFromScreen = async () => {
    const Dropper = (window as EyeDropperWindow).EyeDropper
    if (!Dropper) return
    try {
      const { sRGBHex } = await new Dropper().open()
      onApply(sRGBHex, true)
    } catch {
      // Escape closes the eyedropper without a color.
    }
  }

  return (
    // The field's id and texts are on the picker; its own controls get none.
    <FieldContext.Provider value={null}>
      <View gap="3" width="100%">
        <ColorArea
          hsv={hsv}
          disabled={disabled}
          label={labels.area}
          roleDescription={labels.areaRole}
          valueText={labels.areaValue(Math.round(hsv.s * 100), Math.round(hsv.v * 100))}
          saturateLabel={labels.saturate}
          desaturateLabel={labels.desaturate}
          hint={hint}
          onChange={(s, v) => onChange({ ...hsv, s, v })}
          onCommit={onCommit}
        />
        <View flexDirection="row" alignItems="center" gap="3">
          <View flex={1} gap="3">
            <ChannelSlider
              value={hsv.h}
              max={360}
              bigStep={10}
              label={labels.hue}
              valueText={labels.hueValue(Math.round(hsv.h))}
              hint={hint}
              disabled={disabled}
              thumbColor={fromHsv({ h: hsv.h, s: 1, v: 1 })}
              track={<View position="absolute" inset={0} backgroundImage={hueGradient} />}
              onChange={(h) => onChange({ ...hsv, h })}
              onCommit={onCommit}
            />
            {alpha ? (
              <ChannelSlider
                value={hsv.a * 100}
                max={100}
                bigStep={10}
                label={labels.alpha}
                valueText={`${Math.round(hsv.a * 100)}%`}
                hint={hint}
                disabled={disabled}
                thumbColor={hex}
                track={
                  <>
                    <Checkerboard />
                    <View
                      position="absolute"
                      inset={0}
                      backgroundImage={`linear-gradient(to right, ${withAlpha(opaque, 0)}, ${opaque})`}
                    />
                  </>
                }
                onChange={(a) => onChange({ ...hsv, a: a / 100 })}
                onCommit={onCommit}
              />
            ) : null}
          </View>
          <Swatch color={hex} size={alpha ? '12' : '8'} radius="md" />
        </View>
        {showInput || canPick ? (
          <View flexDirection="row" alignItems="center" gap="2">
            {showInput ? (
              <Input
                flex={1}
                size="sm"
                fontFamily="mono"
                aria-label={labels.input}
                accessibilityHint={hint}
                disabled={disabled}
                invalid={invalid}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                value={draft ?? hex}
                onChangeText={(text) => {
                  setDraft(text)
                  // A whole hex shows at once; anything else waits for Enter or blur.
                  if (FULL_HEX.test(text.trim())) onChange(hsvFrom(text, hsv))
                }}
                onSubmitEditing={finishTyping}
                onBlur={finishTyping}
              />
            ) : null}
            {canPick ? (
              <IconButton
                size="sm"
                variant="outline"
                icon={<PipetteIcon />}
                aria-label={labels.eyeDropper}
                disabled={disabled}
                onPress={pickFromScreen}
              />
            ) : null}
          </View>
        ) : null}
        {items.length ? (
          <View
            role="group"
            aria-label={labels.swatches}
            flexDirection="row"
            flexWrap="wrap"
            gap="1-5"
          >
            {items.map((item, index) => (
              <SwatchButton
                key={`${index}-${item.color}`}
                color={item.color}
                label={item.label}
                selected={item.color === hex}
                disabled={disabled}
                onPress={() => onApply(item.color)}
              />
            ))}
          </View>
        ) : null}
      </View>
    </FieldContext.Provider>
  )
}

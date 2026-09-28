import { CheckIcon, XIcon } from '@advui/icons'
import {
  Children,
  type ReactNode,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
} from 'react'
import {
  type GetProps,
  type TamaguiElement,
  View,
  VisuallyHidden,
  isWeb,
  styled,
  withStaticProperties,
} from 'tamagui'
import { useRipple } from '../../hooks/useRipple'
import { Text } from '../typography/Text'

export type StepStatus = 'complete' | 'current' | 'upcoming' | 'error'
export type StepperOrientation = 'horizontal' | 'vertical'

export interface StepperLabels {
  /** Read before the title. Default: "Step 2 of 4". */
  step: (number: number, count: number) => string
  /** Read after the title. */
  status: Record<StepStatus, string>
}

const defaultLabels: StepperLabels = {
  step: (number, count) => `Step ${number} of ${count}`,
  status: {
    complete: 'completed',
    current: 'current',
    upcoming: 'not started',
    error: 'has errors',
  },
}

interface StepContextValue {
  index: number
  count: number
  activeStep: number
  orientation: StepperOrientation
  linear: boolean
  labels: StepperLabels
  onStepPress?: (index: number) => void
}

const StepContext = createContext<StepContextValue>({
  index: 0,
  count: 1,
  activeStep: 0,
  orientation: 'horizontal',
  linear: true,
  labels: defaultLabels,
})

const StepperFrame = styled(View, {
  name: 'Stepper',
  render: 'ol',
  role: 'list',
  margin: 0,
  padding: 0,

  variants: {
    orientation: {
      horizontal: { flexDirection: 'row', alignItems: 'flex-start' },
      vertical: { flexDirection: 'column' },
    },
  } as const,
})

const StepIndicator = styled(View, {
  name: 'StepIndicator',
  width: '$8',
  height: '$8',
  borderRadius: '$full',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  borderWidth: 2,

  variants: {
    status: {
      complete: { backgroundColor: '$primary', borderColor: '$primary' },
      current: { backgroundColor: '$background', borderColor: '$primary' },
      upcoming: { backgroundColor: '$background', borderColor: '$border' },
      error: { backgroundColor: '$error', borderColor: '$error' },
    },
  } as const,
})

const StepConnector = styled(View, {
  name: 'StepConnector',
  borderRadius: '$full',

  variants: {
    orientation: {
      horizontal: { flex: 1, height: 2, marginHorizontal: '$2' },
      vertical: { flex: 1, width: 2, minHeight: '$4', marginVertical: '$1' },
    },
    done: {
      true: { backgroundColor: '$primary' },
      false: { backgroundColor: '$border' },
    },
  } as const,
})

const StepTitle = styled(Text, {
  name: 'StepTitle',
  size: 'sm',
  weight: 'medium',
})

const StepDescription = styled(Text, {
  name: 'StepDescription',
  size: 'xs',
  tone: 'muted',
})

const visuallyHidden = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  opacity: 0.00000001,
  pointerEvents: 'none',
} as const

const numberColors = {
  current: '$primaryText',
  upcoming: '$mutedForeground',
} as const

export interface StepperProps extends Omit<GetProps<typeof StepperFrame>, 'orientation'> {
  /** Index of the current step, from 0. Steps before it are complete. Use `count` to finish all. */
  activeStep: number
  orientation?: StepperOrientation
  /**
   * Makes steps buttons that go to that step. With `linear` (the default)
   * only steps up to the current one can be pressed.
   */
  onStepPress?: (index: number) => void
  /** Only reached steps can be pressed. Default: true. */
  linear?: boolean
  /** Screen-reader text, for translation. */
  labels?: Partial<StepperLabels>
}

const StepperImpl = forwardRef<TamaguiElement, StepperProps>(function Stepper(
  {
    activeStep,
    orientation = 'horizontal',
    onStepPress,
    linear = true,
    labels: labelsProp,
    children,
    ...props
  },
  ref,
) {
  const labels = { ...defaultLabels, ...labelsProp }
  const steps = Children.toArray(children)
  return (
    <StepperFrame ref={ref} orientation={orientation} {...props}>
      {steps.map((child, index) => (
        <StepContext.Provider
          key={isValidElement(child) && child.key != null ? child.key : index}
          value={{
            index,
            count: steps.length,
            activeStep,
            orientation,
            linear,
            labels,
            onStepPress,
          }}
        >
          {child}
        </StepContext.Provider>
      ))}
    </StepperFrame>
  )
})

export interface StepperStepProps extends Omit<
  GetProps<typeof View>,
  'children' | 'title' | 'onPress'
> {
  title: ReactNode
  description?: ReactNode
  /** Overrides the status from `activeStep`, e.g. `error` for a step that failed validation. */
  status?: StepStatus
  /** Vertical steppers only: content shown under the current step, such as its form. */
  children?: ReactNode
}

/** One step: a numbered marker, a title and a description. */
const StepperStep = forwardRef<TamaguiElement, StepperStepProps>(function StepperStep(
  { title, description, status: statusProp, children, ...props },
  ref,
) {
  const { index, count, activeStep, orientation, linear, labels, onStepPress } =
    useContext(StepContext)
  const status: StepStatus =
    statusProp ?? (index < activeStep ? 'complete' : index === activeStep ? 'current' : 'upcoming')
  const last = index === count - 1
  const vertical = orientation === 'vertical'
  const pressable = !!onStepPress && (!linear || index <= activeStep)
  const ripple = useRipple({ color: '$foreground', disabled: !pressable })
  const current = index === activeStep

  const indicator = (
    <StepIndicator status={status} aria-hidden>
      {status === 'complete' ? (
        <CheckIcon size={16} color="$primaryForeground" />
      ) : status === 'error' ? (
        <XIcon size={16} color="$errorForeground" />
      ) : (
        <Text size="sm" weight="semibold" color={numberColors[status]}>
          {String(index + 1)}
        </Text>
      )}
    </StepIndicator>
  )

  const text = (
    <View
      flexShrink={1}
      minWidth={0}
      gap="$0.5"
      // Horizontal on a phone there is only room for the current step's text;
      // the others keep theirs for screen readers.
      {...(!vertical && !current && { '$max-xs': visuallyHidden })}
    >
      <StepTitle {...(status === 'error' && { tone: 'error' as const })}>
        {/* Inside the title, so it reads as one phrase: "Step 1 of 3: Account, completed". */}
        {isWeb ? <VisuallyHidden>{`${labels.step(index + 1, count)}: `}</VisuallyHidden> : null}
        {title}
        {isWeb ? <VisuallyHidden>{`, ${labels.status[status]}`}</VisuallyHidden> : null}
      </StepTitle>
      {description != null ? <StepDescription>{description}</StepDescription> : null}
    </View>
  )

  // Native has no visually hidden text: the step's name carries it instead.
  const nativeName =
    !isWeb && (typeof title === 'string' || typeof title === 'number')
      ? `${labels.step(index + 1, count)}: ${title}, ${labels.status[status]}${
          typeof description === 'string' ? `. ${description}` : ''
        }`
      : undefined

  const head = (
    <View flexDirection="row" gap="$2.5" alignItems="center" minWidth={0}>
      {indicator}
      {text}
    </View>
  )

  const target = pressable ? (
    <View
      {...(isWeb
        ? { render: 'button', type: 'button', style: { textAlign: 'start' } }
        : { accessible: true, role: 'button', 'aria-label': nativeName })}
      aria-current={current && isWeb ? 'step' : undefined}
      alignSelf="flex-start"
      padding="$1"
      margin="$-1"
      borderWidth={0}
      borderRadius="$md"
      backgroundColor="transparent"
      cursor="pointer"
      hoverStyle={{ backgroundColor: '$accent' }}
      pressStyle={ripple.active ? undefined : { backgroundColor: '$accentHover' }}
      focusVisibleStyle={{ outlineColor: '$ring', outlineStyle: 'solid', outlineWidth: 2 }}
      onPress={() => onStepPress?.(index)}
      {...ripple.props}
    >
      {ripple.element}
      {head}
    </View>
  ) : (
    <View
      {...(!isWeb && nativeName && { accessible: true, 'aria-label': nativeName })}
      {...(current && isWeb && { 'aria-current': 'step' as const })}
    >
      {head}
    </View>
  )

  if (vertical) {
    return (
      <View ref={ref} render="li" flexDirection="column" {...props}>
        {target}
        <View flexDirection="row" gap="$3">
          <View width="$8" alignItems="center" aria-hidden>
            {last ? null : <StepConnector orientation="vertical" done={status === 'complete'} />}
          </View>
          <View flex={1} minWidth={0} paddingBottom={last ? '$0' : '$4'} gap="$3">
            {current ? children : null}
          </View>
        </View>
      </View>
    )
  }

  return (
    <View
      ref={ref}
      render="li"
      flexDirection="row"
      alignItems="flex-start"
      // The last step keeps its width; the lines between steps give way.
      flexGrow={last ? 0 : 1}
      flexShrink={last ? 0 : 1}
      flexBasis="auto"
      minWidth={0}
      maxWidth={last ? '$40' : undefined}
      {...props}
    >
      <View flexShrink={1} minWidth={0} maxWidth="$40">
        {target}
      </View>
      {last ? null : (
        <View
          flex={1}
          minWidth="$4"
          height="$8"
          flexDirection="row"
          alignItems="center"
          aria-hidden
        >
          <StepConnector orientation="horizontal" done={status === 'complete'} />
        </View>
      )}
    </View>
  )
})

/**
 * Shows progress through a multi-step flow, such as a form wizard or
 * checkout. Compose with `Stepper.Step`.
 */
export const Stepper = withStaticProperties(StepperImpl, {
  Step: StepperStep,
})

export { StepperFrame, StepIndicator, StepConnector, StepTitle, StepDescription }

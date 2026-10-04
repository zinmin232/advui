import type { ComponentMeta, PartDoc, PropDoc } from '@advui/core/meta'

// Checks the metadata fields that tools read: closed `options`, child rules and
// the names they point to. The docs only show `type`, so a mistake here would
// go unnoticed until the AdvUI Builder offered a wrong editor or drop target.
// `scripts/generate-catalog.mjs` runs it too, so `pnpm catalog` fails first.

type Meta = Pick<ComponentMeta, 'slug' | 'parts'>

const QUOTED = /^'([^']*)'$/
const NUMBER = /^-?\d+(\.\d+)?$/
// One prop per row: `value`, `aria-label`, `$sm` are names; `a / b` and `…Props` are not.
const PROP_NAME = /^[A-Za-z_$][\w$-]*$/

const isComponent = (part: PartDoc) => (part.kind ?? 'component') === 'component'

/** `'sm' | 'md'` → `['sm', 'md']`, `1 | 2` → `['1', '2']`; anything else → `null`. */
export function literalUnion(type: string): string[] | null {
  const values: string[] = []
  for (const piece of type.split('|')) {
    const text = piece.trim()
    const quoted = QUOTED.exec(text)
    if (quoted) values.push(quoted[1] ?? '')
    else if (NUMBER.test(text)) values.push(text)
    else return null
  }
  return values
}

/** The value of a literal default (`'md'` → `md`, `12` → `12`), or `null` for a note. */
function literalDefault(value: string): string | null {
  const quoted = QUOTED.exec(value)
  if (quoted) return quoted[1] ?? ''
  if (NUMBER.test(value) || value === 'true' || value === 'false') return value
  return null
}

function checkProp(prop: PropDoc, problem: (message: string) => void) {
  if (!PROP_NAME.test(prop.name))
    problem('is not one prop name; give each prop its own row, without `/` or `…`')
  if (prop.type.includes('…')) problem(`type "${prop.type}" has "…"; list every value`)

  const union = literalUnion(prop.type)
  const { options } = prop
  if (union && !options) problem(`type "${prop.type}" is a closed list but has no "options"`)
  if (!options) return

  if (!options.length) problem('"options" is empty')
  const duplicates = options.filter((value, index) => options.indexOf(value) !== index)
  if (duplicates.length) problem(`"options" repeats ${duplicates.map((v) => `"${v}"`).join(', ')}`)
  if (union) {
    const same =
      union.length === new Set(options).size && union.every((value) => options.includes(value))
    if (!same)
      problem(
        `"options" [${options.join(', ')}] do not match type "${prop.type}" [${union.join(', ')}]`,
      )
  }
  const fallback = prop.default === undefined ? null : literalDefault(prop.default)
  if (fallback !== null && !options.includes(fallback))
    problem(`default ${prop.default} is not one of "options" [${options.join(', ')}]`)
}

function checkNumbers(prop: PropDoc, problem: (message: string) => void) {
  if (prop.min !== undefined && prop.max !== undefined && prop.min > prop.max)
    problem(`"min" ${prop.min} is greater than "max" ${prop.max}`)
  if (prop.step !== undefined && !(prop.step > 0)) problem(`"step" ${prop.step} must be above 0`)
}

/**
 * Problems in the given metadata, one line each, naming the component, part
 * and prop: `stack › Stack › flexDirection: …`. Empty when all is well.
 */
export function validateMetadata(metas: Meta[]): string[] {
  const problems: string[] = []
  const known = new Set(metas.flatMap((meta) => meta.parts.filter(isComponent).map((p) => p.name)))

  for (const meta of metas) {
    const seen = new Set<string>()
    for (const part of meta.parts) {
      const at = (message: string) => problems.push(`${meta.slug} › ${part.name}: ${message}`)
      if (seen.has(part.name)) at('is listed twice')
      seen.add(part.name)
      if (part.name.includes(' / ')) at('give each part its own entry, without `/`')

      for (const prop of part.props) {
        const problem = (message: string) =>
          problems.push(`${meta.slug} › ${part.name} › ${prop.name}: ${message}`)
        checkProp(prop, problem)
        checkNumbers(prop, problem)
      }

      if (!isComponent(part)) {
        if (part.children || part.parents || part.within)
          at(`a ${part.kind} has no "children", "parents" or "within"`)
        continue
      }
      const { children } = part
      if (!children) {
        at('has no "children" rules')
        continue
      }
      const { accepts, min, max } = children
      if (Array.isArray(accepts)) {
        if (!accepts.length) at('"children.accepts" is an empty list; use \'none\'')
        for (const name of accepts)
          if (!known.has(name)) at(`"children.accepts" names unknown part "${name}"`)
      }
      if (min !== undefined && min < 0) at(`"children.min" ${min} is below 0`)
      if (max !== undefined && max < 1) at(`"children.max" ${max} is below 1; use accepts 'none'`)
      if (min !== undefined && max !== undefined && min > max)
        at(`"children.min" ${min} is greater than "children.max" ${max}`)
      if (accepts === 'none' && (min !== undefined || max !== undefined))
        at('"children" accepts \'none\' but sets "min" or "max"')
      for (const name of part.parents ?? [])
        if (!known.has(name)) at(`"parents" names unknown part "${name}"`)
      if (part.parents && !part.parents.length) at('"parents" is empty; leave it out')
      if (part.within !== undefined && !known.has(part.within))
        at(`"within" names unknown part "${part.within}"`)
    }
  }
  return problems
}

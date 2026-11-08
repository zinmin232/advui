const logPrefix = 'advui-timing '

/** The rows of a finished run in logcat's output, or null until it has finished. */
export function parseReport(log) {
  const lines = log.split('\n').flatMap((line) => {
    const start = line.indexOf(logPrefix)
    return start < 0 ? [] : [line.slice(start + logPrefix.length).trim()]
  })
  const failed = lines.find((line) => line.startsWith('failed: '))
  if (failed) throw new Error(`/timing ${failed}`)
  const done = lines.lastIndexOf('done')
  return done < 0 ? null : lines.slice(0, done).map((line) => JSON.parse(line))
}

/** Each step that started more animations than its screen's budget allows. */
export const findOverBudget = (rows, budget) =>
  rows.filter(({ screen, springs, timings }) => springs + timings > (budget[screen] ?? Infinity))

export function summarize(rows, budget) {
  const over = findOverBudget(rows, budget)
  return [
    '## Native timing',
    '',
    over.length
      ? `${over.length} of ${rows.length} steps went over their budget of animations.`
      : `All ${rows.length} steps stayed within their budget of animations.`,
    '',
    '| Screen | Step | First frame (ms) | Settled (ms) | Springs | Timings | Budget |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: |',
    ...rows.map(
      ({ screen, step, frame, settled, springs, timings }) =>
        `| ${screen} | ${step} | ${frame} | ${settled} | ${springs} | ${timings} | ${budget[screen] ?? '-'} |`,
    ),
    '',
  ].join('\n')
}

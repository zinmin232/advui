// Web-only global rules. React 19 hoists `<style href precedence>` into <head>
// (including during SSR), so no framework-specific wiring is needed.
const css = `
a.is_Button { text-decoration: none; }
@keyframes aui-spin { to { transform: rotate(360deg); } }
.aui-spinner { animation: aui-spin 0.8s linear infinite; }
@keyframes aui-pulse { 50% { opacity: 0.5; } }
.aui-skeleton { animation: aui-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  /* Loading indicators convey state, so keep them moving — just slower. */
  .aui-spinner {
    animation-duration: 1.6s !important;
    animation-iteration-count: infinite !important;
  }
}
`

export function GlobalStyles() {
  return (
    <style href="adv-ui-global" precedence="default">
      {css}
    </style>
  )
}

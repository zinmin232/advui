// Single place for branding and links. `pnpm rename` updates this file too.
export const siteConfig = {
  name: 'Adv UI',
  shortName: 'aUI',
  description:
    'Cross-platform components for React, Next.js, React Native and Expo — built on Tamagui, themeable, accessible.',
  url: 'https://zinmin232.github.io/advui',
  github: 'https://github.com/zinmin232/advui',
  githubBranch: 'main',
  npmScope: '@advui',
  corePackage: '@advui/core',
  /**
   * Component packages that are not on npm yet. Their pages say so and point to
   * the CLI. Remove a package once it is published.
   */
  unpublishedPackages: [] as string[],
  cliName: 'advui',
  version: '0.12.0',
}

/** Path prefix when the site is served from a sub-folder (GitHub Pages: `/advui`). */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

/**
 * For URLs Next.js does not rewrite itself: iframes, plain `<a>` tags and
 * static files. `<Link>` and `router.push` add the base path on their own.
 */
export const withBasePath = (path: string) => `${basePath}${path}`

/** `/docs/button/` and `/docs/button` are the same page (static exports add the slash). */
export const normalizePath = (path: string) =>
  path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path

export const editUrl = (repoPath: string) =>
  `${siteConfig.github}/edit/${siteConfig.githubBranch}/${repoPath}`

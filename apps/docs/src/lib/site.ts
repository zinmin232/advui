// Single place for branding and links. `pnpm rename` updates this file too.
export const siteConfig = {
  name: 'Adv UI',
  shortName: 'aUI',
  description:
    'Cross-platform components for React, Next.js, React Native and Expo — built on Tamagui, themeable, accessible.',
  url: 'https://adv-ui.dev',
  github: 'https://github.com/zinmin232/advui',
  githubBranch: 'main',
  npmScope: '@adv-ui',
  corePackage: '@adv-ui/core',
  cliName: 'adv-ui',
  version: '0.1.0',
}

export const editUrl = (repoPath: string) =>
  `${siteConfig.github}/edit/${siteConfig.githubBranch}/${repoPath}`

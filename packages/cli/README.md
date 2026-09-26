# adv-ui (CLI)

Copy Adv UI component source into your project, shadcn-style.

```bash
npx adv-ui init                      # detect framework, write config, install base packages
npx adv-ui add button dialog         # add components (dependencies resolved)
npx adv-ui add --all
npx adv-ui list
```

| Option                                       | Description                                                          |
| -------------------------------------------- | -------------------------------------------------------------------- |
| `--registry <url or path>`                   | Registry to read (default: `adv-ui.json`, then https://adv-ui.dev/r) |
| `--cwd <path>`                               | Project directory                                                    |
| `--framework next\|expo\|react-native\|vite` | Skip detection in `init`                                             |
| `--no-install`                               | Print the install command instead of running it                      |
| `--overwrite`                                | Replace existing files                                               |

The registry is generated from component metadata by `pnpm registry:build` in
the monorepo. License: MIT.

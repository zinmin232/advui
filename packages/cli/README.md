# advui (CLI)

Copy Adv UI component source into your project, shadcn-style.

```bash
npx advui init                      # detect framework, write config, install base packages
npx advui add button dialog         # add components (dependencies resolved)
npx advui add --all
npx advui list
```

| Option                                       | Description                                                                        |
| -------------------------------------------- | ---------------------------------------------------------------------------------- |
| `--registry <url or path>`                   | Registry to read (default: `advui.json`, then https://zinmin232.github.io/advui/r) |
| `--cwd <path>`                               | Project directory                                                                  |
| `--framework next\|expo\|react-native\|vite` | Skip detection in `init`                                                           |
| `--no-install`                               | Print the install command instead of running it                                    |
| `--overwrite`                                | Replace existing files                                                             |

The registry is generated from component metadata by `pnpm registry:build` in
the monorepo. License: MIT.

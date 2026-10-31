# advui (CLI)

Copy Adv UI component source into your project, shadcn-style.

```bash
npx advui init                      # detect framework, write config, install base packages
npx advui add button dialog         # add components (dependencies resolved)
npx advui add --all
npx advui diff                      # compare your copies with the registry
npx advui update                    # merge upstream changes into your copies
npx advui list
```

| Option                                       | Description                                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `--registry <url or path>`                   | Registry to read (default: `advui.json`, then https://zinmin232.github.io/advui/r)          |
| `--cwd <path>`                               | Project directory                                                                           |
| `--framework next\|expo\|react-native\|vite` | Skip detection in `init`                                                                    |
| `--no-install`                               | Print the install command instead of running it                                             |
| `--overwrite`                                | `add`: replace existing files. `update`: replace files whose changes conflict with upstream |

## Keeping copies up to date

`add` records each item's registry version and a sha256 hash of each file in
`advui.json`. From that record, `diff` and `update` tell which side changed a
file since you added it:

- **unchanged**: your copy matches upstream.
- **changed upstream**: `update` replaces your copy.
- **changed locally**: `update` keeps your copy.
- **changed in both**: `update` merges upstream's changes into yours (a
  three-way merge against the version you added, which the registry keeps at
  `<registry>/<version>/<name>.json`).

`diff [component...]` lists each file's state and prints a unified diff of
upstream against your copy. `update [component...]` applies the changes and
adds components that updated ones now need. Without names, both cover every
component in `advui.json`. When your changes and upstream's touch the same
lines, `update` leaves that component as it is, lists the files and exits
with code 1: merge them by hand, or pass `--overwrite` to take upstream's.

Components added by `advui` 0.14 or earlier are not in `advui.json`. Name them
(`npx advui diff button`) to compare them; `update` records them once they
match upstream.

The registry is generated from component metadata by `pnpm registry:build` in
the monorepo. License: MIT.

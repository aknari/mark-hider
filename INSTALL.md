---
created: 2026-09-12T19:57
updated: 2026-09-18T09:54
---
# Installing Mark Hider

This plugin is not in Obsidian's community plugin list. Install it manually, from a
release, or with [BRAT](#option-3--brat-auto-updates).

## Requirements

- **Obsidian 1.8.0 or newer.**
- **Desktop.** The hiding is done with CSS hooks on CodeMirror's line elements, so
  behaviour on mobile is untested and may differ.

No other plugin is required, but Mark Hider exists because of one: it hides the marker
comments that plugins like [Task Consolidator](https://github.com/aknari/task-consolidator)
write into your notes.

## Option 1 — From a release (recommended)

1. Download these **three** files from the [latest release](../../releases/latest):

   | File | Why |
   |---|---|
   | `main.js` | The plugin itself. |
   | `manifest.json` | Identity, version and minimum Obsidian version. |
   | `styles.css` | **Required.** The hiding, the location ribbon and the reveal-on-hover are all CSS. Without it the plugin loads but nothing is hidden. |

2. Create the folder `.obsidian/plugins/mark-hider/` inside your vault and copy all
   three files into it.
3. In Obsidian: **Settings → Community plugins**, make sure *Restricted mode* is off,
   then enable **Mark Hider** in the *Installed* tab.

## Option 2 — From source

```bash
git clone https://github.com/aknari/mark-hider
cd mark-hider
npm install
npm run typecheck
npm run build       # bundles into dist/
npm run deploy      # build, then copy dist/ into a vault's plugin folder
```

`npm run build` writes into `dist/` and touches nothing else, so the build does not depend
on where the repository sits. `npm run deploy` copies `dist/main.js`, `dist/styles.css` and
`manifest.json` into a vault's plugin folder: the `../../.obsidian/plugins/mark-hider/` of
the vault the source lives in (`<vault>/80-support/mark-hider/`), or, for a repository kept
anywhere else, wherever `OBSIDIAN_PLUGIN_DIR` points:

```bash
OBSIDIAN_PLUGIN_DIR=~/my-vault/.obsidian/plugins/mark-hider npm run deploy
```

There is no test suite yet, so no `npm test`.

## Option 3 — BRAT (auto-updates)

Install [BRAT](https://github.com/TfTHacker/obsidian42-brat), then run
**BRAT: Add a beta plugin for testing** and enter `aknari/mark-hider`. BRAT installs the
plugin and keeps it updated from this repository's releases.

## First run

1. The eye icon appears in the status bar. Click it to toggle hiding; the same toggle is
   available as the command `Mark Hider: Toggle marker hiding` and as the master setting.
2. Open **Settings → Mark Hider** and review the pattern list. The default pattern
   (`task-consolidator`, mode *Contains*) hides `<!-- task-consolidator:… -->` markers
   only. Other HTML comments stay visible.
3. If you also want Obsidian's own `%% … %%` comments hidden, turn on *Hide all Obsidian
   %% comments*. That toggle is all-or-nothing: patterns govern `<!-- -->` comments
   only.

## What it writes, and where

| Path | What |
|---|---|
| `.obsidian/plugins/mark-hider/data.json` | The plugin's own settings (the toggles and the pattern list). |
| Your notes | **Nothing, ever.** Hiding is purely a rendering effect. |

## Updating

Replace `main.js` with the one from the new release; keep `styles.css` in sync too, since
the class names it targets and the plugin's marking logic are two halves of the same
mechanism. With BRAT, updates are automatic.

## Uninstalling

Disable the plugin, then delete `.obsidian/plugins/mark-hider/`.

Nothing to undo: the plugin never changed a file, so your markers reappear as soon as it
is gone. If you want to remove the marker comments themselves, that is a manual edit or a
search-and-replace in your notes.

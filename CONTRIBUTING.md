---
created: 2026-09-12T19:56
updated: 2026-09-18T09:54
---
# Contributing

Thanks for your interest in Mark Hider.

## Before a big change

Open an issue first and describe the problem. This plugin is deliberately small and
cosmetic, and that is the design:

- **It never writes to your notes.** No file writes at all — hiding is a rendering
  effect.
- **Format-agnostic.** It does not know or care which plugin wrote a marker; patterns
  match any standalone HTML comment.
- **Only standalone comments.** A comment is hidden only when it is the sole content of
  its line, and comments inside fenced code blocks are never touched.

Changes that turn this into a file-writing plugin are unlikely to be accepted.

## Setup

```bash
git clone https://github.com/aknari/mark-hider
cd mark-hider
npm install
npm run typecheck
npm run build
npm run deploy      # build, then copy dist/ into the vault's plugin folder
```

`npm run build` writes into `dist/` and nothing outside it, so the repository can live
anywhere. `npm run deploy` is the one that needs a vault: it copies `dist/` (including
`styles.css`) and `manifest.json` into `<vault>/.obsidian/plugins/mark-hider/` of the vault
this source lives in, or into `OBSIDIAN_PLUGIN_DIR` if you set it.

## Ground rules

- Keep the CSS hooks stable: `body.mh-hidden`, `.cm-line.mh-marked`,
  `.cm-line.mh-marked-obsidian`. `styles.css` depends on them, and they are the whole
  mechanism.
- Do not mutate the editor's DOM. The plugin marks lines with a CodeMirror 6
  `StateField`; the CSS does the hiding.
- `@codemirror/state` and `@codemirror/view` are external in the build and resolved from
  the copy Obsidian ships. Do not bundle them.
- Keep the UI strings in English.

## Tests

There is no test suite yet. The logic worth testing is small (pattern matching and the
"is this a standalone comment line" rule), and a plain-Node suite would be welcome: if
you add one, wire it as `npm test` so CI and contributors can rely on it.

## Testing by hand in Obsidian

1. Add a marker line to a note (`<!-- task-consolidator:tasks:start -->` works).
2. Click the eye icon in the status bar and confirm the line collapses, keeping its
   left-edge ribbon, and that the comment reappears with the caret on the line.
3. Check both Source mode and Live Preview, and confirm a comment inside a fenced code
   block stays visible.

## Pull requests

1. Fork the repository and create a feature branch.
2. Keep the diff focused; one topic per PR.
3. Make sure `npm run typecheck` passes.
4. Describe what changed and why, and say how you checked it in Obsidian, including
   whether you looked at Reading view as well.

Please be respectful and constructive in all interactions.

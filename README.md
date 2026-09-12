# Mark Hider

**Author:** [T. Bautista](https://github.com/aknari)

Hide standalone comment markers in the Obsidian editor with one click, without ever touching your files.

Markers are great for delimiting regions (e.g. `<!-- task-consolidator:tasks:start -->`), but they clutter the editor. **Mark Hider** hides the standalone HTML comments (`<!-- ... -->`) that match the patterns you configure, and can optionally hide **every** Obsidian `%% ... %%` comment. Hidden lines keep a subtle location cue, and the text reappears the moment you need it: when the caret is on the line or you hover it.

## Features

- **Status-bar toggle.** A small eye icon in the status bar shows/hides markers instantly. No reload needed. The same toggle is available as a command (*Toggle marker hiding*) and as a setting.
- **Pattern-based hiding (HTML).** Each pattern matches the *text inside* the comment (between `<!--` and `-->`). Two match modes per pattern:
  - **Contains** — plain substring (case-sensitive). The pattern `*` matches everything.
  - **Regex** — JavaScript regular expression (invalid regexes are ignored).
  - An HTML comment is hidden when it is the **sole content of its line** and **any enabled pattern** matches. Empty or fully disabled pattern list = nothing hidden.
- **Obsidian `%%` comments (optional, all-or-nothing).** The *Hide all Obsidian %% comments* toggle hides **every** standalone `%% ... %%` comment, regardless of patterns — Obsidian's native comments are annotations, not markers, so selective hiding rarely makes sense for them. Patterns only govern `<!-- -->` comments.
- **Format-agnostic.** The plugin does not care which plugin wrote the marker — any standalone HTML comment matching your patterns is hidden (e.g. `task-consolidator:*`, `operon:*`, whatever you need).
- **Only standalone markers are hidden.** A comment is hidden only when it is the sole content of its line (`:only-child`). Comments inside fenced code blocks are never touched.
- **Location cue.** Each hidden marker keeps a thin accent ribbon on the left edge of its line, so sections delimited by markers stay visually distinguishable from ordinary blank lines.
- **Reveal on demand.** Place the caret on a marker line or hover it with the mouse and the comment text reappears — no hunting.
- **Purely cosmetic.** Nothing is written to your notes. In Reading view, Obsidian hides HTML comments natively anyway; this plugin covers Source mode and Live Preview.

## Installation

See **[INSTALL.md](INSTALL.md)** for the release, source and BRAT paths, and for what the plugin writes into your vault.

**Manual install (no build needed):**

1. Create the folder `.obsidian/plugins/mark-hider/` inside your vault.
2. Copy `main.js`, `manifest.json` and `styles.css` into that folder.
3. In Obsidian: **Settings → Community plugins**, make sure Restricted mode is off, and enable **Mark Hider** in the *Installed* tab.

**From source:**

```bash
npm install
npm run build   # compiles and copies main.js into .obsidian/plugins/mark-hider/
```

## Usage

| How | What |
|---|---|
| Status bar (eye icon) | Click to toggle hiding on/off. |
| Command palette | `Mark Hider: Toggle marker hiding`. |
| Settings → Mark Hider | Master toggle, the *Hide all Obsidian %% comments* toggle, and the pattern list. |

### Patterns

Open *Settings → Mark Hider → Marker patterns*. Each row has:

- an **enable/disable** toggle,
- a **mode** dropdown (`Contains` / `Regex`),
- the **pattern text** (e.g. `task-consolidator`),
- a **trash** button to remove it.

Rules (these only apply to `<!-- -->` comments; the `%%` toggle is all-or-nothing):

- **Contains**: the comment's inner text must *contain* the pattern as a substring. A pattern of exactly `*` matches every comment (i.e. "hide everything").
- **Regex**: the comment's inner text is tested against the JavaScript regex (no delimiters or flags; case-sensitive).
- Matching is **case-sensitive**.
- If the list is **empty** or all patterns are **disabled**, nothing is hidden.
- Example: with the default pattern `task-consolidator` (Contains), every `<!-- task-consolidator:... -->` marker is hidden, while other HTML comments stay visible.
- `%%` comments: when the *Hide all Obsidian %% comments* toggle is on, **every** standalone `%% ... %%` comment is hidden; patterns are not consulted.

## How it works

A CodeMirror 6 `StateField` scans the document on every change and marks matching comment lines with a class (`mh-marked`, or `mh-marked-obsidian` for `%%` comments); the bundled `styles.css` then hides, ribbons, and reveals those lines:

```css
body.mh-hidden .cm-line.mh-marked > .cm-comment:only-child { display: none; }
body.mh-hidden .cm-line.mh-marked:has(> .cm-comment:only-child) { /* ribbon cue */ }
body.mh-hidden .cm-line.mh-marked.cm-active > .cm-comment:only-child,
body.mh-hidden .cm-line.mh-marked.cm-activeLine > .cm-comment:only-child,
body.mh-hidden .cm-line.mh-marked:hover > .cm-comment:only-child {
  display: inline; /* revealed on caret / hover */
}
```

No DOM mutation of the editor, no file writes, no dependency on any particular marker format. `@codemirror/state` and `@codemirror/view` are marked as external in the build and resolved from the copy Obsidian ships.

## Requirements

- Obsidian 1.8.0 or newer (desktop; the CSS hooks may behave differently on mobile).

## Development

```bash
npm install
npm run typecheck   # tsc --noEmit
npm run build       # bundles src/main.ts into .obsidian/plugins/mark-hider/main.js
```

## License

MIT © [T. Bautista](https://github.com/aknari). See [LICENSE](LICENSE).
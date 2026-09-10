# Contributing to Mark Hider

Thanks for your interest in contributing!

Please be respectful and constructive in all interactions.

- **Open an issue or discussion** before submitting major changes.
- **Fork** the repository and create a feature branch for your work.
- **Submit a pull request** with a clear description of your changes.
- If you have questions, open an issue.

## Development setup

```bash
git clone <repo-url>
cd mark-hider
npm install
npm run typecheck   # tsc --noEmit
npm run build       # bundles src/main.ts into main.js at the repo root
```

## Testing

There is no automated test suite yet. The pattern-matching logic lives in
`src/main.ts` (`compileMatcher` and the CodeMirror `StateField` scan). When you
change it, please verify manually:

1. Open a note containing standalone `<!-- task-consolidator:... -->` markers
   and an Obsidian `%% comment %%`.
2. With the status-bar toggle on, the matching markers must hide (with the
   location ribbon) and reveal on caret/hover.
3. Toggle the *Hide all Obsidian %% comments* setting and confirm every
   standalone `%% ... %%` comment hides.
4. Confirm comments inside fenced code blocks are never hidden.
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VS Code extension for flash.nvim-style label-based navigation. Single file architecture (`src/extension.ts`, ~630 lines).

## Build Commands

```bash
npm run compile  # Build with esbuild + source maps
npm run watch    # Auto-rebuild on changes
npm test         # Compile + lint + test (Mocha)
vsce package     # Build minified .vsix (~12 KB)
```

Press F5 to test in Extension Development Host.

**Build system**: esbuild bundles `src/extension.ts` → `out/extension.js`. Dev builds use `--sourcemap`, production uses `--minify` (27 KB → 8 KB).

## Architecture

### State Management
Mode-based system (`flashVscodeMode`): `idle`, `active`, `selection`, `lineUp`, `lineDown`, `symbol`, `enter`, `shiftEnter`. Managed via `updateFlashVscodeMode()` and `isMode()`.

### Label Assignment Algorithm
1. Find matches across visible editors, prioritized by active editor and cursor proximity (weighted Euclidean distance)
2. Select label chars from `labelChars` config, excluding chars that follow matches (`nextChars`) to avoid ambiguity
3. Overflow matches get '?' placeholder
4. Create `labelMap`: char → `{editor, position}`

### Decorations
- `dimDecoration`: Opacity-based dimming
- `matchDecoration`: Overlay text via `before` pseudo-element. **Critical**: Spaces must be non-breaking (`\u00A0`) - use `.replace(/ /g, '\u00A0')` or they won't render
- `labelDecoration`/`labelDecorationQuestion`: Jump labels via `before` decorations

### Navigation Modes
- **Symbol** (`alt+enter` or `shift+alt+enter`):
  - Normal mode (`alt+enter`): Uses `vscode.executeDocumentSymbolProvider`, recursively labels all symbols via `itrSymbol()`
  - Treesitter selection (`shift+alt+enter` from any active mode): Uses `vscode.executeSelectionRangeProvider` - labels hierarchical syntactic scopes (expression, statement, block, function, etc.) from cursor position, marks both start and end boundaries for smart selection
- **Line** (`alt+j`/`alt+k`): Labels sequential lines from cursor
- **Enter/Shift+Enter**: Cycles matches by position (`relativeDis` = `line * 1000 + character`), throttled at 70ms

### Search Behavior
- Smart case: case-insensitive unless uppercase in query
- Multi-editor support across split views
- Previous query stored in `prevSearchQuery`

## Code Structure

`src/extension.ts` sections:
1. Lines 1-133: State, config, throttle function
2. Lines 135-170: Helpers (symbol iteration, position calc)
3. Lines 172-425: `updateHighlights()` - core matching and decoration logic
4. Lines 428-628: Command handlers

## Key Implementation Details

- **Command pattern**: Each character (a-z, A-Z, 0-9, symbols, space) registered as VS Code command → `handleInput()` (extensions can't intercept keys directly)
- **Context tracking**: Uses `active` boolean + VS Code context `flash-vscode.active` for keybindings
- **Distance metric**: `lineDiff² * 1000 + charDiff² + distanceOffset`, 10000x weight for non-active editors
- **Selection**: Direction-aware (`isForward`) determines selection anchor
- **Scroll sync**: `onDidChangeTextEditorVisibleRanges` triggers `updateHighlights()`

## Configuration

Loaded via `getConfiguration()`, reloaded on `onDidChangeConfiguration`:
- `caseSensitive`, `dimOpacity`, `matchColor`, `labelColor`, `labelBackgroundColor`, `labelQuestionBackgroundColor`, `matchFontWeight`, `labelFontWeight`, `labelKeys`

## Publishing

Package size optimizations (~12 KB):
- esbuild minification (extension.js: 27 KB → 8 KB)
- `.vscodeignore` excludes: src, tests, CLAUDE.md, source maps, dev files
- All dependencies are devDependencies

Verify size: `vsce package` → check output summary.

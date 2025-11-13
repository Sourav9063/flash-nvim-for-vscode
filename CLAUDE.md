# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VS Code extension for flash.nvim-style label-based navigation. Single file architecture (`src/extension.ts`, ~720 lines).

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
4. Create `labelMap`: char → `{editor, position, range?}` (range stores full scope for treesitter selection)

### Decorations
- `dimDecoration`: Opacity-based dimming
- `matchDecoration`: Overlay text via `before` pseudo-element. **Critical**: Spaces must be non-breaking (`\u00A0`) - use `.replace(/ /g, '\u00A0')` or they won't render
- `labelDecoration`/`labelDecorationQuestion`: Jump labels via `before` decorations

### Navigation Modes
- **Symbol** (`alt+enter` or `shift+alt+enter`):
  - Normal mode (`alt+enter`): Uses `vscode.executeDocumentSymbolProvider`, recursively labels all symbol `selectionRange` positions via `itrSymbol()`
  - Treesitter selection (`shift+alt+enter` from any active mode): Uses `vscode.executeSelectionRangeProvider` via `getSelectionRanges()` - labels hierarchical syntactic scopes (expression, statement, block, function, etc.) from cursor position, marks both start AND end boundaries for each scope (enables selecting entire scopes with one keystroke)
  - **Sticky scroll support**: In symbol mode, disables visible range filtering to include parent scopes shown in sticky scroll area
  - **Full document dimming**: Symbol mode dims entire document (not just visible ranges) to make sticky scroll labels visible
  - When jumping in symbol mode with a range, selects the entire scope (start to end)
- **Line** (`alt+j`/`alt+k`): Labels sequential lines from cursor
- **Enter/Shift+Enter**: Cycles matches by position (`relativeDis` = `line * 1000 + character`), throttled at 70ms

### Search Behavior
- Smart case: case-insensitive unless uppercase in query
- Multi-editor support across split views
- Previous query stored in `prevSearchQuery`

## Code Structure

`src/extension.ts` sections (~720 lines total):
1. Lines 1-133: State, config, throttle function
2. Lines 135-168: Helpers (`itrSymbol`, `relativeVsCodePosition`)
3. Lines 169-215: `getSelectionRanges()` - LSP treesitter-style selection via SelectionRangeProvider
4. Lines 217-482: `updateHighlights()` - core matching and decoration logic
   - Line ~259: Symbol mode check - routes to `getSelectionRanges()` if `isSelection` flag set
   - Lines ~389-404: Visible range filtering (disabled for symbol mode to support sticky scroll)
   - Lines ~451-477: Dimming logic (full document for symbol mode, visible ranges otherwise)
5. Lines 484-720: Command handlers (`start`, `exit`, `jump`, `handleSymbol`, `handleSymbolSelection`, etc.)

## Key Implementation Details

- **Command pattern**: Each character (a-z, A-Z, 0-9, symbols, space, `symbolSelection`) registered as VS Code command → `handleInput()` (extensions can't intercept keys directly)
- **Context tracking**: Uses `active` boolean + VS Code context `flash-vscode.active` for keybindings
- **Distance metric**: `lineDiff² * 1000 + charDiff² + distanceOffset`, 10000x weight for non-active editors
- **Selection**: Direction-aware (`isForward`) determines selection anchor
- **Scroll sync**: `onDidChangeTextEditorVisibleRanges` triggers `updateHighlights()`
- **Async handlers**: `handleSymbol()` and `handleSymbolSelection()` are async and await `updateHighlights()` to ensure LSP calls complete before decorations are applied
- **Treesitter selection boundary markers**: `getSelectionRanges()` adds both start AND end positions of each scope to `allMatches`, creating labels at opening/closing braces, function boundaries, etc.

## Configuration

Loaded via `getConfiguration()`, reloaded on `onDidChangeConfiguration`:
- `caseSensitive`, `dimOpacity`, `matchColor`, `labelColor`, `labelBackgroundColor`, `labelQuestionBackgroundColor`, `matchFontWeight`, `labelFontWeight`, `labelKeys`

## Publishing

Package size optimizations (~12 KB):
- esbuild minification (extension.js: 27 KB → 8 KB)
- `.vscodeignore` excludes: src, tests, CLAUDE.md, source maps, dev files
- All dependencies are devDependencies

Verify size: `vsce package` → check output summary.

## Feature: Smart Symbol & Treesitter Selection

**Marketing highlight**: Dramatically reduces keystrokes for selecting, cutting, and copying code (10+ keystrokes → 2-3).

### Symbol Navigation (`alt+enter`)
- Labels all document symbols (functions, classes, variables)
- Selecting a label jumps to and selects the entire symbol definition
- Use case: Quick function/class selection for cut/copy/refactor

### Treesitter Selection (`shift+alt+enter`)
- Labels hierarchical syntactic scopes around cursor position
- Labels appear on BOTH opening and closing boundaries (`{` and `}`, function start/end, etc.)
- Includes parent scopes visible in sticky scroll
- Selecting a label selects the entire scope (e.g., selecting `{` selects to matching `}`)
- Use case: Fast block/expression/statement selection without manual brace hunting

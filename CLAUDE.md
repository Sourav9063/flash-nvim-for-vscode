# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a VS Code extension that brings flash.nvim-style navigation to Visual Studio Code. It provides label-based code navigation allowing users to quickly jump to any visible location by typing search characters and selecting labeled targets.

## Build and Development Commands

**Build the extension:**
```bash
npm run compile
```
Compiles TypeScript from `src/` to `out/` directory.

**Watch mode (auto-compile on changes):**
```bash
npm run watch
```
Useful during development to automatically recompile on file changes.

**Run tests:**
```bash
npm test
```
Runs `pretest` script (compile + lint) then executes tests using `@vscode/test-cli`.

**Lint code:**
```bash
npm run lint
```
Runs ESLint on the `src` directory.

**Package for publishing:**
```bash
npm run vscode:prepublish
```
Runs before publishing to VS Code marketplace. Currently just runs compile.

**Testing the extension locally:**
Press F5 in VS Code to launch the Extension Development Host with the extension loaded.

## Architecture

### Core State Management

The extension uses a mode-based state system managed by `flashVscodeMode` with the following modes:
- `idle`: Extension inactive
- `active`: Basic navigation mode (triggered by `alt+f`)
- `selection`: Selection mode (triggered by `alt+shift+f`)
- `lineUp`/`lineDown`: Line-based navigation modes
- `symbol`: Symbol-based navigation using document symbols
- `enter`/`shiftEnter`: Sequential match navigation

Mode transitions are managed via `updateFlashVscodeMode()` and `isMode()` helper functions.

### Label Assignment Algorithm

The extension dynamically generates labels for jump targets:

1. **Match Finding**: Searches for text matches across all visible editors, prioritizing:
   - Active editor over other visible editors
   - Proximity to cursor (using weighted Euclidean distance)

2. **Label Character Selection**:
   - Uses `labelChars` configuration (default: a-z, A-Z, 0-9, symbols)
   - Excludes characters that appear after matches (stored in `nextChars`) to prevent ambiguity
   - Remaining characters become `useableLabelChars`
   - If matches exceed available labels, overflow matches get '?' placeholder

3. **Label Mapping**: Creates `labelMap` mapping each label character to `{editor, position}`

### Decoration System

Three main decoration types managed through configuration:
- `dimDecoration`: Dims non-matching text (opacity-based)
- `matchDecoration`: Highlights matched text
- `labelDecoration`/`labelDecorationQuestion`: Shows jump labels using `before` decorations with absolute positioning

### Search Behavior

- **Smart case sensitivity**: Becomes case-sensitive if query contains uppercase letters
- **Multi-editor support**: Works across split editors and visible ranges
- **Query persistence**: Previous query stored in `prevSearchQuery` for reuse with enter key

### Navigation Modes

**Symbol Mode** (`ctrl+enter`):
- Uses VS Code's `vscode.executeDocumentSymbolProvider`
- Recursively iterates through document symbols via `itrSymbol()`
- Labels symbol start positions

**Line Mode** (`alt+j`/`alt+k`):
- Labels line starts sequentially up/down from cursor
- Limited by `labelChars.length`

**Enter/Shift+Enter Navigation**:
- Sorts matches by document position (`relativeDis` = `line * 1000 + character`)
- Cycles through matches forward/backward
- Throttled at 70ms to prevent rapid-fire jumps

### Key Command Registration

The extension dynamically registers commands for all searchable characters:
- Base characters from `searchChars` constant
- Space and mode keywords from `flashVscodeModes`
- All mapped to `handleInput()` with the character as parameter

## Configuration System

Configuration loaded via `getConfiguration()` and reloaded on `onDidChangeConfiguration`:
- `caseSensitive`: Boolean (default: false, overridden by uppercase in query)
- `dimOpacity`: String opacity value
- `matchColor`, `labelColor`, `labelBackgroundColor`: Color customization
- `matchFontWeight`, `labelFontWeight`: Typography
- `labelKeys`: Character pool for labels (critical for label generation)

## Testing

Test files located in `src/test/`. The extension uses:
- Mocha test framework
- `@vscode/test-electron` for VS Code extension testing
- Run via `npm test` which executes `pretest` (compile + lint) then tests

## Important Implementation Details

- **Active state tracking**: Uses both local `active` boolean and VS Code context `flash-vscode.active` for keybinding conditions. The context is set via `setContext` command to enable/disable keybindings.

- **Throttling**: `handleEnterOrShiftEnter` is throttled with a custom throttle function (70ms delay) with a cancel method to prevent pending executions.

- **Editor focus management**: Jump operations handle cross-editor navigation via `vscode.window.showTextDocument()`. Multi-editor support is first-class.

- **Visible range tracking**: `onDidChangeTextEditorVisibleRanges` listener triggers highlight updates during scrolling to ensure labels stay in sync with visible content.

- **Selection behavior**: Selection mode extends from original position to target, with direction-aware character offset. The `isForward` flag determines whether to select from start or end of existing selection.

- **Distance calculation**: Uses a custom distance metric: `lineDiff² * 1000 + charDiff² + distanceOffset` with weight multiplier (10000x) for non-active editors to prioritize active editor matches.

- **Command pattern**: All keyboard input (a-z, A-Z, 0-9, symbols, space) is registered as individual VS Code commands (e.g., `flash-vscode.jump.a`) that call `handleInput()` with the character. This is necessary because VS Code extensions can't directly intercept key events.

## Key User Features from README

- **Two main commands**:
  - `flash-vscode.start` (alt+f): Jump to target
  - `flash-vscode.startSelection` (alt+shift+f): Select to target

- **Search modes**:
  - Type characters to search, then press label to jump
  - Press enter with no query to search previous query or selected text
  - Press enter/shift+enter after search to cycle through matches
  - Press ctrl+enter to label all symbols in file
  - Press alt+j/alt+k to label next/previous lines

- **Smart case**: Search is case-insensitive unless uppercase letters are typed

- **VSCodeVim integration**: Can be mapped to vim keybindings using `vim.normalModeKeyBindingsNonRecursive`

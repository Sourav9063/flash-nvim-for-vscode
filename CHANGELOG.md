# Change Log

All notable changes to the "flash-vscode" extension will be documented in this file.

## [0.5.6] - 2026-09-27

### Added
- **Remote Treesitter Selection** (`shift+alt+enter`): Jump to any location and immediately enter treesitter selection mode on landing, so you can select remote code blocks in one uninterrupted flow.
- `flash-vscode: Exit` is now available in the Command Palette and can be bound to a custom key.

### Changed
- **Symbol Navigation** moved to `ctrl+alt+enter`.
- The extension now activates on startup, so custom keybindings work without first running a command from the Command Palette.

### Fixed
- Remote treesitter selection, line and symbol modes now record the starting position in the Vim jumplist.

## [0.4.41] - 2025-12-31

### Fixed
- **Vim Jumplist Integration**: Jumps are registered in VSCodeVim's jumplist, so `''` and `ctrl+o` work as expected.

## [0.4.40] - 2025-12-26

### Added
- **Treesitter End Labels**: Labels on the end of treesitter ranges for clearer scope visualization (e.g., `{a ... a}`).

### Fixed
- All available label characters are now used in symbol/treesitter mode, so every potential match gets a label.

## [0.4.21] - 2025-11-18

### Added
- **Auto-scroll to next match**: Scrolls to the nearest match when all matches are outside the visible range of the current editor.

### Fixed
- Matches under the cursor are now labeled and highlighted.
- Jumps are no longer missed after an auto-scroll.

## [0.4.11] - 2025-11-16

### Changed
- Embedded demo videos in the README.
- Reduced package size by excluding the assets folder.

## [0.4.0] - 2025-01-15

### Changed
- Renamed to **Flash Nvim for VSCode**.
- Improved description, keywords and README for better discoverability.

## [0.3.31] - 2025-01-10

### Fixed
- Spaces in match highlights now render correctly.

### Changed
- Switched the build from `tsc` to esbuild, reducing package size from 19 KB to 12 KB.

## [0.3.2]

- Initial stable release
- Label-based code navigation
- Multi-editor support
- Symbol and line navigation modes
- Smart case-sensitive search
- VSCodeVim integration

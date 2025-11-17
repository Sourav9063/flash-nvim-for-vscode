# Change Log

All notable changes to the "flash-vscode" extension will be documented in this file.

## [0.4.21] - 2025-11-18

### Added
- **Auto-scroll to next match**: Automatically scrolls to the nearest match if all matches are outside the visible range in the current editor
- Improved search experience with intelligent viewport navigation

### Fixed
- Fixed bug where matches under the cursor were not being labeled and highlighted
- Improved navigation state management after auto-scroll to prevent missing jumps

### Changed
- Refactored auto-scroll logic into a separate function for better code maintainability
- Optimized match visibility checking for better performance

## [0.4.11] - 2025-11-16

### Added
- Added public video URL with embedded video players in README

### Changed
- Replaced markdown video links with HTML5 video tags for better viewing experience
- Excluded assets folder from extension package to reduce bundle size

## [0.4.0] - 2025-01-15

### Changed
- **Rebranded to "Flash Nvim for VSCode"** - Improved branding with proper capitalization
- Removed dot notation from display name for better Google search visibility
- Updated extension name from "flash.nvim for vscode" to "Flash Nvim for VSCode"

### Improved
- **Major SEO optimization** for better discoverability in Google search and VS Code Marketplace
- Reorganized keywords with priority order: "flash nvim for vscode" now ranks #1
- Updated description to front-load most important keywords
- Enhanced README.md with consistent branding throughout
- Optimized for both web search engines and VS Code Marketplace search

### Marketing
- Better positioning to compete with similar extensions (EasyMotion, Jumpy, AceJump)
- Clearer branding that doesn't require special character handling in search engines
- Maintained connection to original flash.nvim plugin while broadening appeal

## [0.3.31] - 2025-01-10

### Fixed
- Fixed space rendering in match highlights by converting spaces to non-breaking spaces (`\u00A0`)

### Changed
- Switched from TypeScript compiler (tsc) to esbuild for faster builds and smaller bundle size
- Reduced extension package size from 19 KB to 12 KB (36% reduction)
- Optimized extension.js from 27 KB to 8 KB through minification

### Improved
- Enhanced SEO optimization for VS Code Marketplace
- Updated README with better installation instructions and feature highlights
- Improved package.json keywords for better discoverability
- Compressed CLAUDE.md documentation for better maintainability

## [0.3.2] - Previous Release

- Initial stable release
- Label-based code navigation
- Multi-editor support
- Symbol and line navigation modes
- Smart case-sensitive search
- VSCodeVim integration
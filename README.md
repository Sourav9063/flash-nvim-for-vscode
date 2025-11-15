# Flash Nvim for VSCode

**Flash Nvim for VSCode** - Fast, precise, label-based code navigation inspired by Neovim's [flash.nvim](https://github.com/folke/flash.nvim) plugin. The most popular Neovim navigation plugin, now available for Visual Studio Code.

[![Version](https://img.shields.io/visual-studio-marketplace/v/souravahmed.flash-vscode-latest?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=souravahmed.flash-vscode-latest)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/souravahmed.flash-vscode-latest?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=souravahmed.flash-vscode-latest)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/souravahmed.flash-vscode-latest?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=souravahmed.flash-vscode-latest)

## Table of Contents

- [Flash Nvim for VSCode](#flash-nvim-for-vscode)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
    - [Why Choose Flash Nvim for VSCode?](#why-choose-flash-nvim-for-vscode)
    - [Perfect Alternative To](#perfect-alternative-to)
  - [Installation](#installation)
    - [Install from VS Code Marketplace](#install-from-vs-code-marketplace)
  - [Usage](#usage)
    - [Tutorial](#tutorial)
  - [Configuration](#configuration)
    - [Case Sensitivity](#case-sensitivity)
    - [Appearance Customization](#appearance-customization)
    - [VSCodeVim Integration (Optional)](#vscodevim-integration-optional)
  - [Acknowledgements](#acknowledgements)
  - [Keywords \& Search Terms](#keywords--search-terms)

## Overview

**Flash Nvim for VSCode** brings the power of Neovim's most popular navigation plugin, [flash.nvim](https://github.com/folke/flash.nvim), to Visual Studio Code. This extension provides lightning-fast, label-based code navigation that lets you jump to any visible location with just 2-3 keystrokes.

### Why Choose Flash Nvim for VSCode?

- **⚡ Lightning Fast**: Jump anywhere on screen in milliseconds
- **🎯 Precise Navigation**: Label-based system eliminates guesswork
- **🧠 Smart Symbol & Treesitter Selection**: Instantly select entire functions, blocks, or scopes - turns 10+ keystrokes into 2-3 for daily copy/cut/refactor tasks
- **🌐 Universal**: Works with [vscode.dev](https://vscode.dev) (VS Code for Web)
- **👥 For Everyone**: **No Vim knowledge required** - great for all developers
- **🔥 Battle-Tested**: Based on Neovim's most loved navigation plugin
- **🎨 Highly Customizable**: Adjust colors, labels, and behavior to your preference

### Perfect Alternative To

Looking for alternatives to **EasyMotion**, **Jumpy**, **Jumpy2**, or **AceJump**? **Flash Nvim for VSCode** offers superior performance and a more intuitive label system, making it the best choice for fast code navigation in VS Code.

## Installation

### Install from VS Code Marketplace

**Method 1: Direct Install** (Recommended)
1. [Click here to install Flash Nvim for VSCode](https://marketplace.visualstudio.com/items?itemName=souravahmed.flash-vscode-latest) directly from the VS Code Marketplace
2. Click the "Install" button
3. VS Code will open and install the extension automatically

**Method 2: Install from VS Code**
1. Open Visual Studio Code
2. Go to the Extensions view (`Ctrl+Shift+X` on Windows/Linux or `Cmd+Shift+X` on macOS)
3. Search for **"flash nvim for vscode"** or **"flash vscode"**
4. Look for the extension by **souravahmed**
5. Click **Install**
6. Reload VS Code if prompted

**Method 3: Command Line**
```bash
code --install-extension souravahmed.flash-vscode-latest
```

## Usage

### Tutorial

[Tutorial Video](https://github.com/Sourav9063/flash-nvim-for-vscode/raw/refs/heads/main/assets/444379853-b4660aa8-dd2d-4c9f-9622-c01521747a76.mp4)

1. **Activate Navigation:**
   Flash VSCode provides two main functionalities:

   - **`flash-vscode.start`**: `alt+f` Moves the cursor directly to the selected target.
   - `alt+f` while some text is selected will search for the selected text.

     ![flash jump](https://github.com/user-attachments/assets/9a416efd-0927-4df8-b1f1-81d1582f328c)

   - Press `alt+f` or `alt+shift+f` then `<search>` then `enter` to goto next match, `shift+enter` to goto previous match.
   - Press `alt+f` or `alt+shift+f` then `enter` to search previously entered query.
   - Select text and press `alt+f` or `alt+shift+f` then `enter` to search and mark the selected text.
   - Press `alt+f` then `alt+enter` to mark all symbols (functions, classes, variables) in the current file.
   - Press `alt+f` (or any active flash mode) then `shift+alt+enter` for treesitter-style selection - marks hierarchical syntactic scopes (expressions, statements, blocks) around cursor for smart selection.

     ![flash enter](https://github.com/user-attachments/assets/e2f932e3-73c6-4acd-9d8c-9937bb116821)

   - Press `alt+f` then `alt+j` or `alt+k` to mark all the next line or previous line.
     | Next Line | Previous Line |
     | :--------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------: |
     | ![Screenshot (178)](https://github.com/user-attachments/assets/9281233c-2021-4a4a-9a8b-e5e0bdfa350c) | ![Screenshot (176)](https://github.com/user-attachments/assets/ef55f28b-3560-4884-a131-b2ac04ec9453) |

2. **🚀 Smart Symbol & Treesitter Selection - Game Changer for Daily Coding:**
   
[Treesitter Selection](https://github.com/Sourav9063/flash-nvim-for-vscode/raw/refs/heads/main/assets/513752343-5b5e6205-204a-4a52-ad81-fbb328094156.mov)

| Treesitter Label | Treesitter Selection |
| :--------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------: |
| <img width="624" alt="Screenshot 2025-11-13 at 2 11 14 PM" src="https://github.com/user-attachments/assets/b317f631-e20a-4948-90b2-bd88cdfb55ef" /> | <img width="624" alt="Screenshot 2025-11-13 at 2 11 31 PM" src="https://github.com/user-attachments/assets/b63c4987-9d73-4995-914a-4b6ceddbdfd6" /> |

   **Dramatically reduce the friction of selecting, cutting, and copying code.** No more tedious click-dragging, Shift+Arrow key combos, or hunting for scope boundaries!

   **Symbol Navigation** (`alt+enter`):
   - **Instantly jump to and select any function, class, or variable** in your file
   - Press `alt+f` → `alt+enter` to label all symbols
   - Hit a label key to select the **entire symbol definition** (from start to end)
   - Perfect for: Quickly selecting functions to cut/copy/refactor

   **Treesitter Selection** (`shift+alt+enter`):
   - **The fastest way to select code scopes** - expressions, statements, blocks, functions
   - Press `alt+f` (or any active flash mode) → `shift+alt+enter`
   - Labels appear on **both opening and closing boundaries** (`{` and `}`, function start/end, etc.)
   - Includes **sticky scroll context** - parent scopes visible at the top
   - Select a label to **automatically select the entire scope**
   - No more manual "find the matching brace" - LSP knows your code structure!

   **Why this matters for daily programming:**
   - Want to copy a function? `alt+f` → `alt+enter` → hit the label → `Ctrl+C` ✅
   - Need to select an if-block? `shift+alt+enter` → hit the label → Done ✅
   - Refactoring nested code? Jump between scope boundaries instantly ✅
   - **Turns 10+ keystrokes into 2-3 keystrokes** for common selection tasks

4. **Selection:**

   - **`flash-vscode.startSelection`**: `alt+shift+f` Extends the selection from the original position to the target.

     ![flash select](https://github.com/user-attachments/assets/e3a12392-3ab5-4ff7-a657-f28c4b09da2d)

3. **Preview**
   - Added a preview in status bar.
     
     <img width="380" height="231" alt="image" src="https://github.com/user-attachments/assets/61c93756-6323-47f1-acbe-d92ba961601b" />


4. **Cancel Navigation:**
   - Press `Backspace` to remove the last character of your query, or press `Escape` to exit jump mode.

## Configuration

### Case Sensitivity

By default, `flash-vscode`'s search is using smart case. Meaning if any uppercase latter exists then becomes case sensitive, else becomes case insensitive. To change this behavior, add to your settings:

```json
{
  "flash-vscode.caseSensitive": false
}
```

### Appearance Customization

The following configuration options allow you to customize the visual appearance of Flash VSCode:

```json
{
  "flash-vscode.dimOpacity": "0.65",
  "flash-vscode.matchColor": "#3e68d7",
  "flash-vscode.matchFontWeight": "bold",
  "flash-vscode.labelColor": "#ffffff",
  "flash-vscode.labelBackgroundColor": "#ff007c",
  "flash-vscode.labelQuestionBackgroundColor": "#3E68D7",
  "flash-vscode.labelFontWeight": "bold",
  "flash-vscode.labelKeys": "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:'\",.<>/?"
}
```

- `flash-vscode.dimOpacity`: Opacity used to dim text.
- `flash-vscode.matchColor`: Color used for matched text.
- `flash-vscode.matchFontWeight`: Font weight for matched text.
- `flash-vscode.labelColor`: Color used for label text.
- `flash-vscode.labelBackgroundColor`: Background color for labels.
- `flash-vscode.labelQuestionBackgroundColor`: Background color for question labels.
- `flash-vscode.labelFontWeight`: Font weight for label text.
- `flash-vscode.labelKeys`: Characters to use for labels.

### VSCodeVim Integration (Optional)

To invoke Flash VSCode commands from VSCodeVim, in your `settings.json`, add entries to `"vim.normalModeKeyBindingsNonRecursive"` as follows:

```json
"vim.normalModeKeyBindingsNonRecursive": [
  {
    "before": ["s"],
    "commands": ["flash-vscode.start"]
  },
  {
    "before": ["S"],
    "commands": ["flash-vscode.startSelection"]
  },
  {
    "before": [ "<BS>" ],
    "commands": [ "flash-vscode.backspace" ]
  },
]
```

This configuration triggers Flash VSCode when you press `s` or `S` in normal mode.

## Acknowledgements

- [flash.nvim](https://github.com/folke/flash.nvim) for the original ideas.
- [Jumpy2](https://marketplace.visualstudio.com/items?itemName=DavidLGoldberg.jumpy2) for some of the implementation details.
- [flash.vscode](https://github.com/cunbidun/flash.vscode) flash.vscode(latest) extension is supper set of this extension.
- [CVim-PR](https://github.com/VSCodeVim/Vim/issues/8567) [CVim](https://github.com/cuixiaorui/vscodeVim/tree/flash) for ux improvement ideas.
 
## Keywords & Search Terms

**Popular Searches**: flash.nvim, flash nvim, flash.nvim vscode, flash nvim vscode, flash vscode, flash.vscode, neovim, nvim, vim navigation, vscode navigation, code jump, label jump, easymotion alternative, jumpy alternative, acejump alternative, quick navigation, cursor jump, code navigation extension, vscode jump to, fast navigation, keyboard navigation, vim motions, vscodevim extension, neovim vscode, vim for vscode, treesitter vscode, smart selection, scope selection, symbol navigation, code scope selection

**Related Extensions**: VSCodeVim, EasyMotion, Jumpy, Jumpy2, AceJump, Vim, Neovim

**Use Cases**: code navigation, quick jump, label-based navigation, keyboard-driven development, productivity tools, vim workflow, neovim workflow, fast coding, efficient navigation, smart code selection, scope-based selection, treesitter selection, symbol jumping, function selection, block selection, code refactoring, quick copy paste, efficient code editing

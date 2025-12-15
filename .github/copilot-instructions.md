# AI Coding Instructions for spdxheader

## Project Overview
This is a VS Code extension that adds SPDX license headers to source files. It supports configurable header formats per language/file extension, integrates with SPDX license list data for validation, and provides commands for adding/updating headers across files or workspaces.

## Architecture
- **Entry Point**: `entry.js` - Registers VS Code commands and manages configuration
- **Commands**: Located in `cmd/` (add.js, addef.js, update.js, move_ws.js, update_ws.js) - Each implements a specific header operation
- **Helpers**: `helper/` contains utilities for VS Code integration, messaging, repo operations, and workspace paths
- **License Logic**: `helper.patch/license.js` - Core header application, license validation against SPDX IDs, and format generation
- **Data**: `license-list-data/` provides SPDX license definitions; `build/licenses.json` contains extracted license IDs
- **Build Output**: `build/entry.js` - Bundled ES module ready for VS Code

## Key Workflows
- **Build Extension**: Run `resize=1 make` to bundle, minify, and package. Requires `pnpm`, `esbuild`, `terser`, `vsce`, `jq`, `m4` in PATH. Clones `../vscdevp` for shared dependencies.
- **Development**: Edit source files, run build, then `code --install-extension spdxheader-*.vsix` to test
- **License Management**: Place license text files in `LICENSES/` directory (e.g., `GPL-3.0-or-later`) for user selection

## Configuration Patterns
- **Language-Specific Headers**: Use `spdxheader.spdx` config with file extensions as keys (e.g., `"js": "/* {} */"`, `"py": "# {}"`)
- **Shebang Support**: Configure `spdxheader.shebang` for script interpreters (e.g., `"python": "/usr/bin/python3"`)
- **Copyright Blocks**: Enable via `spdxheader.copyright_enabled`, format with `spdxheader.copyright` (requires `{}` placeholder)

## Coding Conventions
- **ES Modules**: Use `import`/`export` syntax throughout
- **Async Commands**: All command implementations are async functions exported as `exec`
- **Error Handling**: Use `die()` from `helper/mesg.js` for fatal errors, `info()` for user feedback
- **License Validation**: Check against `license_ids` Set from `build/licenses.json`
- **File Matching**: Use `picomatch` for extension/language pattern matching
- **VS Code APIs**: Access via destructured imports (e.g., `const { showQuickPick } = window`)
- **Lean Code**: Prefer concise, minimal implementations; avoid unnecessary abstractions or boilerplate
- **Naming**: Use snake_case for function names (kernel-style); ensure names are semantically correct and accurately describe functionality

## Examples
- **Adding SPDX Header**: In `cmd/add.js`, match file extension to config, generate format like `/* SPDX-License-Identifier: MIT */`
- **License Selection**: Use `spdx_pick_license()` to show QuickPick of files from `LICENSES/`, validate against SPDX IDs
- **Header Patching**: Apply headers by inserting at file top, handling existing headers via replace logic in `spdx_emit_header()`

## Dependencies
- **Runtime**: VS Code ^1.74.0, picomatch for glob matching
- **Build**: esbuild for bundling, terser for minification, @vscode/vsce for packaging
- **External Data**: SPDX license list from license-list-data submodule

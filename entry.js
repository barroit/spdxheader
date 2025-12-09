/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { cwd } from 'node:process'
import { commands } from 'vscode'

const {
	registerCommand: add_cmd,
	registerTextEditorCommand: add_editor_cmd
} = commands

const cmds = {
	'add':       [ import('./cmd/add.js'),       add_editor_cmd ],
	'update':    [ import('./cmd/update.js'),    add_editor_cmd ],
	'move-ws':   [ import('./cmd/move_ws.js'),   add_cmd ],
	'update-ws': [ import('./cmd/update_ws.js'), add_cmd ],
}

export async function activate(ctx)
{
	for (const id of Object.keys(cmds)) {
		const [ module_promise, add ] = cmds[id]
		const module = await module_promise
		const exec = add(`spdxheader.${id}`, module.exec, ctx)

		ctx.subscriptions.push(exec)
	}
}

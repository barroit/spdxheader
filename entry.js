/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { commands, workspace } from 'vscode'

const {
	registerCommand: cmd,
	registerTextEditorCommand: editor_cmd
} = commands

const { getConfiguration: config_of } = workspace

const cmds = {
	'add':       [ import('./cmd/add.js'),       editor_cmd ],
	'update':    [ import('./cmd/update.js'),    editor_cmd ],
	'move-ws':   [ import('./cmd/move_ws.js'),   cmd        ],
	'update-ws': [ import('./cmd/update_ws.js'), cmd        ],
}

export async function activate(ctx)
{
	const config = config_of('spdxheader.format')

	for (const id of Object.keys(cmds)) {
		const [ module_promise, cb ] = cmds[id]
		const module = await module_promise

		const exec = cb(`spdxheader.${id}`, module.exec, { ctx, config })

		ctx.subscriptions.push(exec)
	}
}

/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { commands, workspace } from 'vscode'

import { vsc_map_ctx } from './helper/vsc.js'

const {
	registerCommand: cmd,
	registerTextEditorCommand: editor_cmd
} = commands

const { getConfiguration: config_of } = workspace

const cmds = {
	'add':       [ import('./cmd/add.js'),       editor_cmd ],
	'addef':     [ import('./cmd/addef.js'),     editor_cmd ],
	'update':    [ import('./cmd/update.js'),    editor_cmd ],
	'move-ws':   [ import('./cmd/move_ws.js'),   cmd        ],
	'update-ws': [ import('./cmd/update_ws.js'), cmd        ],
}

export async function activate(ctx)
{
	const fetch_format = () => config_of('spdxheader')

	for (const id of Object.keys(cmds)) {
		const [ module_promise, cb ] = cmds[id]

		const module = await module_promise
		const cmd_ctx = vsc_map_ctx(ctx)

		const exec = cb(`spdxheader.${id}`, module.exec, cmd_ctx)

		cmd_ctx.fetch_format = fetch_format
		ctx.subscriptions.push(exec)
	}
}

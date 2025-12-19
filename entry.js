/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { commands, workspace } from 'vscode'

import { vsc_map_ctx } from './helper/vsc.js'

const {
	registerCommand: vsc_cmd,
	registerTextEditorCommand: vsc_editor_cmd
} = commands

const { getConfiguration: vsc_fetch_config } = workspace

const cmds = {
	'add':       [ import('./cmd/add.js'),       vsc_editor_cmd ],
	'addef':     [ import('./cmd/addef.js'),     vsc_editor_cmd ],
	'update':    [ import('./cmd/update.js'),    vsc_editor_cmd ],
	'move-ws':   [ import('./cmd/move_ws.js'),   vsc_cmd        ],
}

function fetch_format()
{
	return vsc_fetch_config('spdxheader')
}

export async function activate(ctx)
{
	for (const id of Object.keys(cmds)) {
		const [ module_promise, cb ] = cmds[id]

		const module = await module_promise
		const cmd_ctx = vsc_map_ctx(ctx)

		const exec = cb(`spdxheader.${id}`, module.exec, cmd_ctx)

		cmd_ctx.fetch_format = fetch_format
		ctx.subscriptions.push(exec)
	}
}

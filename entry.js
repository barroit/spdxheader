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
	'addef':     [ import('./cmd/addef.js'),     editor_cmd ],
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

		const cmd_ctx = {
			environ: ctx.environmentVariableCollection,
			current: ctx.extension,

			binary: {
				mode: ctx.extensionMode,
				path: ctx.extensionPath,
				uri: ctx.extensionUri,
			},

			datadir: ctx.globalStoragePath,
			datadir_uri: ctx.globalStorageUri,

			ws_datadir: ctx.storagePath,
			ws_datadir_uri: ctx.storageUri,

			logdir: ctx.logPath,
			logdir_uri: ctx.logUri,

			secret: ctx.secrets,

			state: ctx.globalState,
			ws_state: ctx.workspaceState,

			config,
		}

		const exec = cb(`spdxheader.${id}`, module.exec, cmd_ctx)

		ctx.subscriptions.push(exec)
	}
}

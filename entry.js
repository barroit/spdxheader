/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { cwd } from 'node:process'
import { commands } from 'vscode'

const { registerTextEditorCommand: register } = commands

const cmds = {
	'spdxheader.add':       import('./cmd/add.js'),
	'spdxheader.update':    import('./cmd/update.js'),
	'spdxheader.move-ws':   import('./cmd/move-ws.js'),
	'spdxheader.update-ws': import('./cmd/update-ws.js'),
}

export async function activate(ctx)
{
	for (const id of Object.keys(cmds)) {
		const module = await cmds[id]
		const exec = register(id, module.exec)

		ctx.subscriptions.push(exec)
	}
}

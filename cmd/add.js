/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { die, format_spdx, info, require_license, spdx_fmt } from '../helper.js'
import { window, Position as position } from 'vscode'

const { showQuickPick: quick_pick } = window

export async function exec(editor)
{
	const doc = editor.document
	const prompt = 'Select the target license'
	const license = await require_license(prompt, 'target license')

	const fmt = spdx_fmt(doc.languageId, this.config)
	const spdx = format_spdx(fmt, license)

	const lines = doc.lineCount
	const line0 = doc.lineAt(0)

	if (spdx == line0.text) {
		info('nothing to be done')
		return
	}
	
	editor.edit(edit =>
	{
		const pos = new position(0, 0)

		edit.insert(pos, `${spdx}\n`)

		if (line0.text != '' || lines == 1)
			edit.insert(pos, '\n')

	}).then(() => info(`new header with ${license}`))
}

/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { fetch_license, die } from '../helper.js'
import { window, Position as position } from 'vscode'

const { showQuickPick: quick_pick } = window

export async function exec(editor)
{
	const doc = editor.document
	const config = this.config

	const lang = doc.languageId
	let spdx = config['.']

	if (lang in config)
		spdx = config[lang]

	const licenses = fetch_license()
	const license = await quick_pick(licenses)

	if (!license)
		die('no license selected')

	if (!spdx.match(/\{\}/))
		spdx += ' {}'

	spdx = spdx.replace(/\{\}/, `SPDX-License-Identifier: ${license}`)

	const lines = doc.lineCount
	const line0 = doc.lineAt(0)
	const old = line0.text

	if (spdx == old)
		return
	
	editor.edit(edit =>
	{
		const pos = new position(0, 0)

		edit.insert(pos, `${spdx}\n`)

		if (old != '' || lines == 1)
			edit.insert(pos, '\n')
	})
}

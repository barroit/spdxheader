/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { Position as position } from 'vscode'

import { info } from '../helper/mesg.js'
import {
	gen_spdx_header,
	require_license,
} from '../helper.patch/license.js'

export async function exec(editor)
{
	const doc = editor.document

	const license = await require_license('Select the target license',
					      'target license')
	const header = gen_spdx_header(doc.languageId, this.config, license)

	const lines = doc.lineCount
	const line0 = doc.lineAt(0)

	if (header == line0.text) {
		info('nothing to be done')
		return
	}

	await editor.edit(edit =>
	{
		const pos = new position(0, 0)

		edit.insert(pos, `${header}\n`)

		if (line0.text != '' || lines == 1)
			edit.insert(pos, '\n')
	})

	info(`new header with ${license}`)
}

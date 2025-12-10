/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import {
	workspace,
	WorkspaceEdit as vsc_ws_edit,
	Uri as vsc_uri,
} from 'vscode'

import { ls_files } from '../helper/repo.js'
import {
	apply_spdx_fmt,
	gen_spdx_fmt,
	require_license,
} from '../helper.patch/license.js'

const {
	applyEdit: vsc_apply_edit,
	openTextDocument: vsc_open,
	saveAll: vsc_save_all,
} = workspace

function move(doc, edit, old_license, new_license)
{
	const fmt = gen_spdx_fmt(doc.languageId, this.config)

	const old_spdx = apply_spdx_fmt(fmt, old_license)
	const new_spdx = apply_spdx_fmt(fmt, new_license)

	const line0 = doc.lineAt(0)

	if (line0.text != old_spdx)
		return

	edit.replace(doc.uri, line0.range, new_spdx)
}

export async function exec()
{
	const edit = new vsc_ws_edit()

	const old_license = await require_license(
		'Select the license to replace', 'old license')
	const new_license = await require_license(
		'Select the license to replace with', 'new license')

	let files = ls_files()
	let tasks = []

	files = files.map(vsc_uri.file)

	for (const file of files) {
		const task = vsc_open(file).then(doc =>
		{
			move.call(this, doc, edit, old_license, new_license)
			return doc

		}).catch(() => undefined)

		tasks.push(task)
	}

	tasks = await Promise.all(tasks)
	await vsc_apply_edit(edit)

	tasks = tasks.map(doc => doc && doc.save())
	return tasks
}

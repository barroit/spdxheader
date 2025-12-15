/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { extname } from 'node:path'

import { isMatch as test } from 'picomatch'
import { Position as vsc_pos, Range as vsc_range, window } from 'vscode'

import { info, die } from '../helper/mesg.js'
import { git_user_name, git_user_email } from '../helper/git.js'

import { fmt_has_arg, fmt_ensure_arg } from '../helper.patch/fmt.js'
import {
	spdx_pick_license,
	spdx_fixup_id,
	spdx_emit_header,
} from '../helper.patch/spdx.js'

const { showQuickPick: vsc_quick_pick } = window

const INSERT  = 0
const REPLACE = 1

function keys_to_set(obj)
{
	const arr = Object.keys(obj)
	const set = new Set(arr)

	return set
}

function pick_fmt_key(ext, lang, format)
{
	const results = {}
	const checks = [
		[ 'shebang', 'shebang',           [ ext, lang      ] ],
		[ 'spdx',    'spdx',              [ ext, lang, '*' ] ],
		[ 'copr',    'copyright',         [ ext, lang, '*' ] ],
		[ 'copr_y',  'copyright_enabled', [ ext, lang      ] ],
	]

	for (const [ name, key, search ] of checks) {
		const list = keys_to_set(format[key])
		const found = search.find(val => val && list.has(val))

		results[name] = found
	}

	return results
}

function map_fmt_list(fmts, keys)
{
	return {
		shebang: fmts.shebang[keys.shebang],
		spdx:    fmts.spdx[keys.spdx],
		copr:    fmts.copyright[keys.copr],
		copr_y:  fmts.copyright_enabled[keys.copr_y],
	}
}

function is_copr_enabled(path, ignores)
{
	return ignores && test(path, ignores)
}

function push_change(from, to, at, queue)
{
	if (from == to)
		return 1

	const pos = new vsc_pos(at, 0)

	if (!from) {
		queue.push([ pos, to, REPLACE ])
		return 1

	} else {
		queue.push([ pos, to, INSERT ])
		return 0
	}
}

async function require_shebang_binary(map)
{
	const keys = Object.keys(map)

	if (!keys)
		die('malformatted shebang config')

	const items = Object.values(map)
	const binary = vsc_quick_pick(items, {
		title: 'Select the binary filled in shebang',
		placeHolder: 'binary',
	})

	if (!binary)
		die('no binary selected')

	return binary
}

async function insert_shebang(editor, shebang, changes, next)
{
	const doc = editor.document
	const line = doc.lineAt(next)

	if (typeof shebang != 'string')
		shebang = await require_shebang_binary(shebang)

	const header = `#!${shebang}`

	return push_change(line.text, header, next, changes)
}

async function insert_spdx(editor, fmt, changes, next, args)
{
	const doc = editor.document
	const state = this.ws_state

	let id = args && args[0]

	if (!id) {
		id = await spdx_pick_license({
			prompt: 'Select the target license',
			hint: 'target license',
		})
	}
	state.update('license', id)

	const new_fmt = fmt_ensure_arg(fmt)
	const new_id = spdx_fixup_id(id)

	const header = spdx_emit_header(new_fmt, new_id)
	const line = doc.lineAt(next)

	return push_change(line.text, header, next, changes)
}

function emit_copr_header(fmt, id)
{
	return fmt.replace(/\{\}/, `SPDX-License-Identifier: ${id}`)
}

async function insert_copr(editor, fmts, changes, next_in)
{
	const doc = editor.document
	const date = new Date()
	const year = date.getFullYear()

	const user = git_user_name()
	const email = git_user_email()
	const repl = `Copyright ${year} ${user} <${email}>`

	let found = 0
	let next = next_in

	for (const fmt of fmts) {
		const line = doc.lineAt(next)
		let header = fmt

		if (fmt_has_arg(fmt)) {
			found++
			header = fmt.replace(/\{\}/, repl)
		}

		next += push_change(line.text, header, next, changes)
	}

	if (found > 1)
		die('found multiple placeholders in copyright format list')
	if (found == 0)
		die('no placeholder found in copyright format list')

	return next - next_in
}

function apply_changes(cursor, changes, next)
{
	for (const [ start, text, mode ] of changes) {
		if (mode == REPLACE)
			cursor.replace(start, text)
		else
			cursor.insert(start, `${text}\n`)
	}

	const [ last ] = changes.pop()

	if (last.line == next) {
		const pos = new vsc_pos(next, 0)

		cursor.insert(pos, '\n')
	}
}

export async function exec(editor, dumbass, args)
{
	const doc = editor.document
	const path = doc.uri.fsPath

	const lang = doc.languageId
	let ext = extname(path)

	if (ext)
		ext = ext.slice(1)

	const keys = pick_fmt_key(ext, lang, this.format)
	const fmts = map_fmt_list(this.format, keys)
	const use_copr = is_copr_enabled(path, fmts.copr_y)

	const tasks = [
		[ fmts.shebang,             insert_shebang, fmts.shebang ],
		[ fmts.spdx,                insert_spdx,    fmts.spdx    ],
		[ fmts.copr_y && fmts.copr, insert_copr,    fmts.copr    ],
	]
	const changes = []
	let next = 0

	for (const [ cond, func, data ] of tasks) {
		if (!cond)
			continue

		next += await func.call(this, editor, data, changes, next, args)
	}

	if (!changes.length)
		return

	editor.edit(cursor => apply_changes(cursor, changes, next))

	if (!doc.isUntitled)
		doc.save()
}

/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { existsSync as exists, readdirSync as readdir } from 'node:fs'
import { join } from 'node:path'
import { window } from 'vscode'

import { die } from '../helper/mesg.js'
import { git_show_toplevel } from '../helper/git.js'

const { showQuickPick: vsc_quick_pick } = window

const { ids: license_id_arr } = await import('../build/licenses.json')
const license_ids = new Set(license_id_arr)

function spdx_scan_license()
{
	const toplevel = git_show_toplevel()
	const license_dir = join(toplevel, 'LICENSES')
	let licenses = []

	if (exists(license_dir))
		licenses = readdir(license_dir)

	return licenses
}

export async function spdx_pick_license(config)
{
	const licenses = spdx_scan_license()

	if (!licenses.length)
		die('no license found in LICENSES/')

	const license = await vsc_quick_pick(licenses, {
		title: config.prompt,
		placeHolder: config.hint,
	})

	if (!license)
		die('no license selected')

	return license
}

export function spdx_fixup_id(id)
{
	if (!license_ids.has(id))
		id = `LicenseRef-${id}`

	return id
}

export function spdx_emit_header(fmt, id)
{
	return fmt.replace(FMT_ARG_RE, `SPDX-License-Identifier: ${id}`)
}

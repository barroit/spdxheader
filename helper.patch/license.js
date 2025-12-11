/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { existsSync as exists, readdirSync as readdir } from 'node:fs'
import { join } from 'node:path'
import { window } from 'vscode'

import { die } from '../helper/mesg.js'
import { prefix } from '../helper/repo.js'

const { showQuickPick: vsc_quick_pick } = window

const { ids: spdx_license_id_arr } = await import('../build/licenses.json')
const spdx_license_ids = new Set(spdx_license_id_arr)

function fetch_license()
{
	const repo = prefix()
	const license_dir = join(repo, 'LICENSES')
	let licenses = []

	if (exists(license_dir))
		licenses = readdir(license_dir)

	return licenses
}

export async function require_license(title, prompt)
{
	const licenses = fetch_license()

	if (!licenses.length)
		die('no license found in LICENSES/')

	const config = { title, placeHolder: prompt }
	const license = await vsc_quick_pick(licenses, config)

	if (!license)
		die('no license selected')

	return license
}

export function gen_spdx_fmt(lang, dict)
{
	let fmt = dict['.']

	if (lang in dict)
		fmt = dict[lang]

	if (!fmt.match(/\{\}/))
		fmt += ' {}'

	return fmt
}

export function apply_spdx_fmt(fmt, license)
{
	if (!spdx_license_ids.has(license))
		license = `LicenseRef-${license}`

	return fmt.replace(/\{\}/, `SPDX-License-Identifier: ${license}`)
}

export function gen_spdx_header(lang, dict, license)
{
	const fmt = gen_spdx_fmt(lang, dict)
	const header = apply_spdx_fmt(fmt, license)

	return header
}

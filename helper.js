/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { execFileSync as node_exec } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { workspace, window } from 'vscode'

const {
	showInformationMessage: vsc_info,
	showErrorMessage: vsc_error,
	showWarningMessage: vsc_warn,
	showQuickPick: vsc_quick_pick,
} = window

const wfs = workspace.workspaceFolders
const wf = wfs[0]

const wf_uri = wf.uri
const wf_path = wf_uri.fsPath

function exec(...args)
{
	return node_exec(...args, { cwd: wf_path, encoding: 'utf8' })
}

function capitalize(str)
{
	const first = str.charAt(0)
	const rest = str.slice(1)

	return first.toUpperCase() + rest
}

export function die(mesg)
{
	const ui_mesg = capitalize(mesg)

	vsc_error(ui_mesg)
	throw new Error(`fatal: ${mesg}`)
}


export function warn(mesg)
{
	mesg = capitalize(mesg)
	vsc_warn(mesg)
}

export function info(mesg)
{
	mesg = capitalize(mesg)
	vsc_info(mesg)
}

export function fetch_license()
{
	const output = exec('git', [ 'rev-parse', '--show-toplevel' ])

	const repo = output.slice(0, -1)
	const license_dir = `${repo}/LICENSES`
	let licenses = []

	if (existsSync(license_dir))
		licenses = readdirSync(license_dir)

	return licenses
}

export function ls_files()
{
	const output = exec('git', [ 'ls-files', '--cached',
				     '--others', '--exclude-standard' ])
	const files = output.split('\n')

	files.pop()
	return files.map(file => `${wf_path}/${file}`)
}

export function spdx_fmt(lang, config)
{
	let fmt = config['.']

	if (lang in config)
		fmt = config[lang]

	if (!fmt.match(/\{\}/))
		fmt += ' {}'

	return fmt
}

export async function require_license(title, prompt)
{
	const licenses = fetch_license()
	const opt = { title, placeHolder: prompt }
	const license = await vsc_quick_pick(licenses, opt)

	if (!license)
		die('no license selected')

	return license
}

export function format_spdx(fmt, license)
{
	return fmt.replace(/\{\}/, `SPDX-License-Identifier: ${license}`)
}

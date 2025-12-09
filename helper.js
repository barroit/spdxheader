/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { workspace, window } from 'vscode'

const {
	showErrorMessage: vsc_error,
	showWarningMessage: vsc_warn,
} = window

export function die(reason)
{
	const mesg = `fatal: ${reason}`

	vsc_error(mesg)
	throw new Error(mesg)
}

export function warn(reason)
{
	const mesg = `warn: ${reason}`

	vsc_warn(mesg)
}

export function fetch_license()
{
	const wfs = workspace.workspaceFolders
	const wf = wfs[0]

	const wf_uri = wf.uri
	const wf_path = wf_uri.fsPath

	const output = execFileSync('git', [ 'rev-parse', '--show-toplevel' ], {
		cwd: wf_path,
	})

	const repo = output.slice(0, -1)
	const license_dir = `${repo}/LICENSES`
	let licenses = []

	if (existsSync(license_dir))
		licenses = readdirSync(license_dir)

	return licenses
}

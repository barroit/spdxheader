/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { commands } from 'vscode'

const { executeCommand: exec_cmd } = commands

export function exec()
{
	const state = this.ws_state

	const license = state.get('license')
	const args = [ license ]

	exec_cmd('spdxheader.add', args)
}

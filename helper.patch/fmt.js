/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

export function fmt_has_arg(fmt)
{
	return fmt.match(/\{\}/)
}

export function fmt_ensure_arg(fmt)
{
	if (!fmt_has_arg(fmt))
		fmt += ' {}'

	return fmt
}

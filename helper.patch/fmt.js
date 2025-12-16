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

function keys_to_set(obj)
{
	const arr = Object.keys(obj)
	const set = new Set(arr)

	return set
}

export function fmt_resolve(map, ext, lang, target_arr = [])
{
	ext = ext.slice(1)

	const ret = {}
	let checks = [
		[ 'shebang', 'shebang',           [ ext, lang      ] ],
		[ 'spdx',    'spdx',              [ ext, lang, '*' ] ],
		[ 'copr',    'copyright',         [ ext, lang, '*' ] ],
		[ 'copr_y',  'copyright_enabled', [ ext, lang      ] ],
	]
	const target = new Set(target_arr)

	if (target.size)
		checks = checks.filter(([ name ]) => target.has(name))

	for (const [ name, key, search ] of checks) {
		const list = keys_to_set(map[key])
		const found = search.find(val => val && list.has(val))

		ret[name] = map[key][found]
	}

	return ret
}

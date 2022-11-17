
// const { expose }	= require('threads/worker')
// const { bundle }	= require('@heat/code')
// const { writeFile }	= require('fs/promises')

import { expose }		from 'threads/worker'
import { bundle }		from '@heat/code'
import { writeFile }	from 'fs/promises'

expose({
	build: async (input, output, options) => {
		const { code, map } = await bundle(input, {
			...options,
			format: 'cjs',
			sourceMap: true,
			external(importee) {
				return (options.externals || []).includes(importee)
			},
		})

		await Promise.all([
			writeFile(output, code),
			writeFile(`${output}.map`, map.toString())
		])
	},
})

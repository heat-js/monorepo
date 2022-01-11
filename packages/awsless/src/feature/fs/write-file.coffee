
import mkdirp	from 'mkdirp'
import fs		from 'fs'
import path		from 'path'

export default (file, data) ->
	await mkdirp path.dirname file
	await fs.promises.writeFile file, data

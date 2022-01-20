
import mkdirp	from 'mkdirp'
import fs		from 'fs'
import path		from 'path'

export default (file, data) ->
	directory = path.dirname file
	# await mkdirp directory
	fs.mkdirSync directory, { recursive: true }
	fs.writeFileSync file, data

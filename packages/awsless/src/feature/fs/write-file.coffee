
import fs		from 'fs'
import path		from 'path'

export default (file, data) ->
	directory = path.dirname file
	fs.mkdirSync directory, { recursive: true }
	fs.writeFileSync file, data

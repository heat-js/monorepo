
import fs from 'fs'

export default (path) ->
	try
		stats = await fs.promises.stat path

	catch error
		if error.message.includes 'no such file or directory'
			return false

		throw error

	return stats.isFile()


import fs			from 'fs'
import path 		from 'path'
import isDirectory	from './is-directory'

isVisible = (file) ->
	parts = file.split '/'

	for part in parts
		if part.startsWith '_'
			return false

	return true

export default listFilesRecursive = (directory) ->
	if Array.isArray directory
		files = await Promise.all directory.map listFilesRecursive
		return files.flat()

	if not await isDirectory directory
		return [ directory ]

	files = await fs.promises.readdir directory
	files = files.filter isVisible
	files = await Promise.all files.map (file) =>
		file = path.join directory, file
		return listFilesRecursive file

	return files.flat()

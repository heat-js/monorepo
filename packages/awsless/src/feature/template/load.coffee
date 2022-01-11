
import fs			from 'fs'
import path 		from 'path'
import parse		from './parse'
import listFiles	from '../fs/list-files-recursive'

export default (directory) ->
	files = await listFiles directory
	files = files.filter (file) ->
		extension = path
			.extname file
			.toLowerCase()

		return [ '.yml', '.yaml' ].includes extension

	if files.length is 0
		throw new Error "AWS template directory has no template files inside."

	template = {}

	await Promise.all files.map (file) ->
		data = await fs.promises.readFile file
		data = parse data
		data = data or {}

		# Check if we find duplicate keys inside our template.
		for key in Object.keys data
			if typeof template[ key ] isnt 'undefined'
				throw new Error "AWS template has a duplicate key for: #{ key }"

		Object.assign template, data

	return template

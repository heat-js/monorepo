
import objectPath from 'object-path'

export default (paths, templates) ->
	# console.log paths, templates
	return paths.map (path) ->
		return objectPath.get templates, (
			path
				.replace /^\//, ''
				.replace /\/$/, ''
				.replace /\//gm, '.'
		)

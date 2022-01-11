
import fetchSsm	from '../feature/fetch/ssm'

export default (paths, root) ->

	parameters = await fetchSsm {
		paths
		profile:	root.Config.Profile
		region:		root.Config.Region
	}

	return paths.map (path) ->
		return parameters[ path ]

# export default (paths, root) ->
# 	ordered = []
# 	reqions = {}

# 	for path in paths
# 		parts = path.split ':'
# 		switch parts.length
# 			when 1
# 				region	= root.Config.Region
# 				path	= parts[0]
# 			when 2
# 				[ region, path ] = parts
# 			else
# 				throw new Error "Invalid ssm value: #{ path }"

# 		ordered.push {
# 			region
# 			path
# 		}

# 		if not list = reqions[ region ]
# 			list = reqions[ region ] = [ ]

# 		list.push path

# 	await Promise.all Object.keys(reqions).map (reqion) ->
# 		parameters = await fetchSsm {
# 			region
# 			paths:		reqions[ region ]
# 			profile:	root.Config.Profile
# 		}

# 		console.log 'reqion', reqion
# 		console.log 'paths', reqions[ region ]
# 		# console.log 'parameters', parameters

# 		for path, value of parameters
# 			item = ordered.find (item) ->
# 				return item.region is region and item.path is path

# 			console.log item, value

# 			item.value = value

# 	console.log reqions
# 	console.log ordered

# 	return ordered.map ({ value }) ->
# 		return value


import AWS			from 'aws-sdk'
import store		from 'aws-param-store'
import cache		from '../utils/function-cache'
import Credentials	from '../client/credentials'

formatPaths = (paths) ->
	return paths.map (path) ->
		if path[0] is '/'
			return path

		return "/#{ path }"

export default cache ({ paths, profile, region }) ->
	formattedPaths = formatPaths paths
	result = await store.getParameters formattedPaths, {
		credentials: Credentials { profile }
		region
	}

	parameters = {}
	for formattedPath, index in formattedPaths
		parameter = result.Parameters.find (item) ->
			return item.Name is formattedPath

		if not parameter
			throw new Error "SSM value not found: #{ formattedPath }"

		parameters[ paths[index] ] = parameter.Value

	return parameters

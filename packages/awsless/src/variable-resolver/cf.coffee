
import fetchExports	from '../feature/fetch/exports'

export default (names, root) ->
	profile = root.Config.Profile
	region 	= root.Config.Region

	names = names.map (name) ->
		data = name.split ':'
		if data.length is 1
			return {
				name:	data[0]
				region
			}

		return {
			name:	data[1]
			region: data[0]
		}

	return Promise.all names.map ({ name, region }) ->
		data = await fetchExports { profile, region }
		return data[ name ]

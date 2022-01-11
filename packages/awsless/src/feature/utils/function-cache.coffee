
import cache from 'function-cache'

export default (callback) ->
	return cache callback, { useFileCache: false }

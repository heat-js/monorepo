
import createHash from './hash'

export default (args...) ->
	return createHash(
		'sha1'
		JSON.stringify args
		'hex'
	).substr 0, 16

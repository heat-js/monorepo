
import crypto from 'crypto'

export default (alg, content, encoding) ->
	hash = crypto.createHash alg
	hash.update content
	return hash.digest encoding

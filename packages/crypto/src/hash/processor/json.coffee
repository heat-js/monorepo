
export default class Json

	hash: (payload, passphrase) ->
		payload = JSON.stringify payload
		payload = new Buffer payload, 'utf8'

		return payload

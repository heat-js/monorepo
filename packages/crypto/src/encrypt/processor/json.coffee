
export default class Json

	encrypt: (payload) ->
		payload = JSON.stringify payload
		payload = new Buffer payload, 'utf8'

		return payload

	decrypt: (payload) ->
		return JSON.parse payload

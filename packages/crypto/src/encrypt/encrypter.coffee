
export default class Encrypter

	separator: '.'

	constructor: (@processors) ->

	get: (version) ->
		return @processors[version - 1].slice()

	parse: (payload) ->
		parts = String payload
			.split @separator

		version = parts.shift()
		version = parseInt version, 10

		payload = parts.join @separator

		return {
			version: version or 1
			payload
		}

	needsUpgrade: (payload) ->
		{ version } = @parse payload
		return @processors.length isnt version

	recrypt: (payload, passphrase) ->
		payload = @decrypt payload, passphrase
		payload = @encrypt payload, passphrase

		return payload

	encrypt: (payload, passphrase, version = @processors.length) ->
		for processor in @get version
			payload = processor.encrypt payload, passphrase

		return [ version, payload ].join @separator

	decrypt: (payload, passphrase) ->
		{ version, payload } = @parse payload

		processors = @get version
		processors.reverse()

		for processor in processors
			payload = processor.decrypt payload, passphrase

		return payload

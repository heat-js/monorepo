
import crypto from 'crypto'

export default class Hashing

	constructor: (@algorithm, @salt) ->

	generateKey: (passphrase) ->
		return Buffer.concat [
			Buffer.from @salt, 'utf8'
			Buffer.from passphrase or '', 'utf8'
		]

	hash: (payload, passphrase) ->
		key 	= @generateKey passphrase
		payload = String payload

		hmac = crypto.createHmac @algorithm, key
		hmac.update payload, 'utf8'
		hash = hmac.digest 'hex'

		return hash


import crypto from 'crypto'

export default class Encryption

	constructor: (@algorithm, @salt) ->

	generateKey: (passphrase = '') ->
		return crypto.createHash 'sha256'
			.update String @salt
			.update String passphrase
			.digest 'base64'
			.substr 0, 32

	encrypt: (payload, passphrase) ->

		key = @generateKey passphrase

		payload 	= String payload
		iv 			= crypto.randomBytes 16
		cipher  	= crypto.createCipheriv @algorithm, key, iv
		encrypted 	= cipher.update payload, 'utf8'
		encrypted 	= Buffer.concat [ encrypted, cipher.final() ]

		return [
			iv.toString 'hex'
			encrypted.toString 'hex'
		].join ':'

	decrypt: (payload, passphrase) ->
		[ iv, encrypted ] = payload.split ':'

		iv = new Buffer iv, 'hex'

		key = @generateKey passphrase

		decipher  = crypto.createDecipheriv @algorithm, key, iv
		decrypted = decipher.update encrypted, 'hex'
		decrypted = Buffer.concat [ decrypted, decipher.final() ]

		return decrypted.toString 'utf8'

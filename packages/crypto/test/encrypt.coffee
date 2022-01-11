
import Json						from '../src/encrypt/processor/json'
import ManipulationProtection	from '../src/encrypt/processor/manipulation-protection'
import Encryption 				from '../src/encrypt/processor/encryption'
import Encrypter				from '../src/encrypt/encrypter'

describe 'Upgradable Encrypt', ->

	encrypter = new Encrypter [
		[
			new Json
			new ManipulationProtection 'sha1', '4z2skeZtQe6ftKY6s4r8dM3427'
			new Encryption 'aes-256-ctr', '8MEi48Yc29VF6pKsXrA7Kj699H'
		]
		[
			new Json
			new ManipulationProtection 'sha256', 'fN849Xf6ahpL48qT7K8Dbu2Pj3'
			new Encryption 'aes-256-cbc', '4wjT6444tU8A63CW9hwXevDm8A'
		]
	]

	it 'should encrypt & decrypt data', ->
		expectations = [
			{ payload: 1, 			passphrase: null }
			{ payload: 1, 			passphrase: undefined }
			{ payload: 1, 			passphrase: 'test' }
			{ payload: -1, 			passphrase: 'test' }
			{ payload: 'abc', 		passphrase: 'test' }
			{ payload: null,		passphrase: 'test' }
			{ payload: [ 'lol' ],	passphrase: 'test' }
			{ payload: { test: 1 },	passphrase: 'test' }
		]

		for expectation in expectations

			result = encrypter.encrypt(
				expectation.payload
				expectation.passphrase
			)

			expect result
				.toBeDefined()

			payload = encrypter.decrypt(
				result
				expectation.passphrase
			)

			expect JSON.stringify payload
				.toBe JSON.stringify expectation.payload

		return

	it 'should upgrade old encrypted values', ->
		oldEncryptionValue = encrypter.encrypt(
			'payload'
			'passphrase'
			1
		)

		expect encrypter.needsUpgrade oldEncryptionValue
			.toBe true

		newEncryptionValue = encrypter.recrypt oldEncryptionValue, 'passphrase'

		expect newEncryptionValue
			.toBeDefined()

		expect oldEncryptionValue
			.not.toBe newEncryptionValue

		expect encrypter.needsUpgrade newEncryptionValue
			.toBe false


	it 'should always return different results for the same input', ->
		array = [ 0...5 ]
		array = array.map ->
			return encrypter.encrypt 'payload', 'passphrase'

		expectation = array.shift()

		for result in array
			expect result
				.not.toBe expectation

		return

	it 'should fail on invalid encrypted value', ->

		invalidData = [
			'123'
			'1@1'
			null
			undefined
			1
			-1
			new Array
			new Object
			encrypter.encrypt('123').substring 0, -1
		]

		for data in invalidData
			expect ->
				encrypter.decrypt data
			.toThrow()

		return

	it 'should fail on different passphrases', ->

		result = encrypter.encrypt 'payload', 'passphrase-1'

		expect ->
			encrypter.decrypt result, 'passphrase-2'
		.toThrow()

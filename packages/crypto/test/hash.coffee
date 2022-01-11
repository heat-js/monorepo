
import Json			from '../src/hash/processor/json'
import Hashing		from '../src/hash/processor/hashing'
import Blowfish		from '../src/hash/processor/blowfish'
import Hasher		from '../src/hash/hasher'

describe 'Upgradable Hash', ->

	hasher = new Hasher [
		[
			new Json
			new Hashing 'md5', '4z2skeZtQe6ftKY6s4r8dM3427'
		]
		[
			new Json
			new Hashing 'sha1', '4z2skeZtQe6ftKY6s4r8dM3427'
		]
		[
			new Json
			new Hashing 'sha256', '4z2skeZtQe6ftKY6s4r8dM3427'
		]
		[
			new Json
			new Hashing 'sha512', '4z2skeZtQe6ftKY6s4r8dM3427'
		]
	]

	it 'should hash & compare data', ->
		expectations = [
			{ payload: 1, 				version: 1, passphrase: null }
			{ payload: 1, 				version: 2, passphrase: undefined }
			{ payload: 1, 				version: 3, passphrase: 'test' }
			{ payload: -1, 			 	version: 1 }
			{ payload: 'abc', 		 	version: 2 }
			{ payload: null,		 	version: 3 }
			{ payload: [ 'lol' ],	 	version: 1 }
			{ payload: { test: 1 },	 	version: 2 }
			{ payload: { test: null }, 	version: 3 }
		]

		other = 'something else'

		for expectation in expectations

			hash = hasher.hash(
				expectation.payload
				expectation.passphrase
				expectation.version
			)

			expect hash
				.toBeDefined()

			expect hasher.compare expectation.payload, hash, expectation.passphrase
				.toBe true

			expect hasher.compare other, hash, expectation.passphrase
				.toBe false

			expect hasher.compare expectation.payload, other, expectation.passphrase
				.toBe false

			expect hasher.compare expectation.payload, hash, other
				.toBe false


		return

	it 'should upgrade old hash values', ->
		oldHash = hasher.hash 'payload', 'passphrase', 1

		expect hasher.needsUpgrade oldHash
			.toBe true

		newHash = hasher.hash 'payload', 'passphrase'

		expect newHash
			.toBeDefined()

		expect oldHash
			.not.toBe newHash

		expect hasher.needsUpgrade newHash
			.toBe false

	it 'should allow for paranoid crazy setups', ->

		crazy = new Hasher [
			[
				new Json
				new Hashing 'sha1', 	'4z2skeZtQe6ftKY6s4r8dM3427'
				new Hashing 'sha256', 	'4z2skeZtQe6ftKY6s4r8dM3427'
				new Hashing 'sha512', 	'4z2skeZtQe6ftKY6s4r8dM3427'
			]
		]

		hash = crazy.hash 'payload'

		expect crazy.compare 'payload', hash
			.toBe true

		return

	it 'should support blowfish for passwords', ->

		hasher = new Hasher [
			[
				new Json
				new Hashing 'sha1', '4z2skeZtQe6ftKY6s4r8dM3427'
				new Blowfish 1
			]
		]

		hash = hasher.hash 'payload'

		expect hasher.compare 'payload', hash
			.toBe true

		expect hasher.compare 'other', hash
			.toBe false

		return


import handle 		from '../src/handle'
import Middleware, { Cache } from '../src/middleware/cache'

describe 'Cache Middleware', ->

	cache = new Cache

	it 'should have correct initial behavior', ->
		expect cache.size()
			.toBe 0

		expect cache.has 'key'
			.toBe false

		expect cache.get 'key'
			.toBe undefined

	it 'should have correct size', ->
		cache.set 'key', true
		expect cache.size()
			.toBe 1

	it 'should set entry', ->
		values = [
			undefined
			null
			1
			0
			-1
			'string'
			new Array
			new Object
		]

		for value, index in values
			key = "key-#{ index }"
			cache.set key, value

			expect cache.has key
				.toBe true

			expect cache.get key
				.toStrictEqual value

		return

	it 'should delete entry', ->
		cache.set 'key', true
		expect cache.has 'key'
			.toBe true

		cache.delete 'key'
		expect cache.has 'key'
			.toBe false

	it 'should get copy of the data', ->
		value = {}
		cache.set 'key', value

		expect cache.get 'key'
			.not.toBe value

	it 'should not copy of the data with cloning off', ->
		value = {}
		cache = new Cache { useClones: false }
		cache.set 'key', value

		expect cache.get 'key'
			.toBe value

	it 'should remove values after memory limit is reached', ->
		cache = new Cache { memoryLimit: 0.01 }
		cache.set 'key-1', true

		expect cache.size()
			.toBe 1

		cache.set 'key-2', true

		expect cache.size()
			.toBe 1

		expect cache.has 'key-1'
			.toBe false

	it 'should be able to disable memory limit', ->
		cache = new Cache { memoryLimit: 0 }

		for i in [ 0...100 ]
			cache.set i, true

		expect cache.size()
			.toBe 100

	# it 'should throw on invalid values', ->
	# 	class TestClass

	# 	values = [
	# 		->
	# 		=>
	# 		TestClass
	# 		new TestClass
	# 	]

	# 	for value, index in values
	# 		key = "key-#{ index }"
	# 		cache.set key, value

	# 		# expect cache.has key
	# 		# 	.toBe true

	# 		console.log	index, cache.get key

	# 		# expect cache.get key
	# 		# 	.toStrictEqual value

	# 	return

	it 'should work with the Middleware class', ->
		lambda1 = handle(
			new Middleware
			(app) ->
				cache = app.get 'cache', 'ns'
				cache.set 'foo', 'bar'
		)

		lambda2 = handle(
			new Middleware
			(app) ->
				cache = app.get 'cache', 'ns'
				app.output = cache.get 'foo'
		)

		lambda3 = handle(
			new Middleware
			(app) ->
				cache = app.cache
				app.output = cache.get 'foo'
		)

		await lambda1()
		result = await lambda2()

		expect result
			.toBe 'bar'

		result = await lambda3()
		expect result
			.toBeUndefined()

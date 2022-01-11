import { Container, add, alias, factory, get } from '../src/index'

test 'test normal usage', ->
	c = new Container

	c.define 'test', ->
		'help!'

	c.add 'test_add', [
		'get'
		'noic'
	]

	expect c.get 'test'
		.toBe 'help!'

	expect c.get 'test_add'
		.toEqual ['get', 'noic']

	c.add 'test_add', 'yes'

	expect c.get 'test_add'
		.toEqual ['get', 'noic', 'yes']

	c.configure test_alias: alias 'test_add'

	expect c.get 'test_alias'
		.toEqual ['get', 'noic', 'yes']

	c.add 'test_add', 'no'

	expect c.get 'test_alias'
		.toEqual ['get', 'noic', 'yes', 'no']

	expect c.get 'test_alias'
		.toEqual c.get 'test_add'


	c.configure
		'coins.managed': add 'btc'
		'coins': true

	expect c.get 'coins.managed'
		.toEqual ['btc']

	c.configure
		'coins.managed': add 'eth'

	expect c.get 'coins.managed'
		.toEqual ['btc', 'eth']

	c.configure
		'coins.managed': ['bch']

	expect c.get 'coins.managed'
		.toEqual ['bch']


test 'has', ->
	c = new Container

	expect c.has 'test'
		.toBe false

	c.define 'test', 'oi'

	expect c.has 'test'
		.toBe true


test 'add', ->
	c = new Container

	c.define 'test', add 'test'

	expect c.get 'test'
		.toEqual ['test']

	c.define 'test', add 'test'

	expect c.get 'test'
		.toEqual ['test', 'test']

	c = new Container

	try
		c.get 'test'
	catch e

	expect e
		.toEqual expect.anything()


test 'factory', ->
	c = new Container
	c.define 'test', factory (c, ...args) -> args

	expect c.get 'test', 'help'
		.toEqual ['help']

	expect c.get 'test', 'yes', 'no'
		.toEqual ['yes', 'no']

test 'get', ->
	c = new Container
	c.define 'test', factory (c, ...args) -> args
	c.define 'test_get', get('test', 'yes')

	expect c.get 'test', 'help'
		.toEqual ['help']

	expect c.get 'test_get', 'help'
		.toEqual ['yes']

	expect c.get 'test', 'yes', 'no'
		.toEqual ['yes', 'no']

	expect c.get 'test_get'
		.toEqual ['yes']

test 'proxy', ->
	c = Container.proxy()
	c.foo = 'bar'

	expect c.foo
		.toEqual 'bar'

	expect c['foo']
		.toEqual 'bar'

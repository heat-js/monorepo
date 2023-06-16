
import DefinitionParser	from './definition-parser'
import Migrator			from './migrator'
import { requestPort }	from '@heat/request-port'
import Seeder			from './seeder'
import Server			from './server'
import StreamEmitter	from './stream-emitter'

export start = (config = {}) ->
	parser		= new DefinitionParser
	server		= new Server config.region
	stream 		= new StreamEmitter config.stream
	migrator	= new Migrator server.dynamodb()
	seeder		= new Seeder server.documentClient(), config.seed

	timeout		= config.timeout or 30 * 1000

	releasePort = null
	beforeAll ->
		[port, releasePort] = await requestPort()

		definitions = await parser.parse config.path

		stream.setDefinitions definitions

		await server.listen port
		await migrator.migrate definitions
		await seeder.seed()
	, timeout

	afterAll ->
		await server.destroy()
		await releasePort()
	, timeout

	return {
		documentClient: ->
			client = server.documentClient()
			stream.attach client

			return client

		dynamodb: ->
			return server.dynamodb()
	}

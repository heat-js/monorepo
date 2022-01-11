
import FileSystem		from '../dynamodb/file-system'
import PortFinder		from '../dynamodb/port-finder'
import Server			from './server'

export start = (config = {}) ->
	fs 			= new FileSystem
	portFinder	= new PortFinder fs
	server		= new Server
	timeout		= config.timeout or 30 * 1000

	beforeAll ->
		port = config.port or await portFinder.find()
		await server.listen port

	, timeout

	afterAll ->
		await server.destroy()
		await portFinder.release()

	, timeout

	return {
		client: ->
			return server.client()
	}

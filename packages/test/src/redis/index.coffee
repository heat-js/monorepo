
import { requestPort }	from '@heat/request-port'
import Server			from './server'

export start = (config = {}) ->
	server		= new Server
	timeout		= config.timeout or 30 * 1000

	releasePort = null
	beforeAll ->
		[port, releasePort] = await requestPort()
		await server.listen port
	, timeout

	afterAll ->
		await server.destroy()
		await releasePort()
	, timeout

	return {
		client: ->
			return server.client()
	}

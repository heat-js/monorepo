
import { requestPort } from '../../helpers/port'
import { Server } from './server'
import { migrate, seed as runSeed, SeedData } from './database'
import { loadDefinitions } from './definition'

interface Options {
	path: string
	timeout?: number
	port?: number
	seed?: SeedData
}

export const startDynamoDB = ({ path, timeout = 30 * 1000, seed = {} }:Options) => {

	const server = new Server()
	let releasePort

	globalThis.beforeAll(async () => {
		const [ port, release ] = await requestPort()
		releasePort = release

		await server.listen(port)
		await server.wait()

		const definitions = await loadDefinitions(path)

		await migrate(server.getClient(), definitions)
		await runSeed(server.getDocumentClient(), seed)
	}, timeout)

	globalThis.afterAll(async () => {
		await server.kill()
		await releasePort()
	}, timeout)

	return server
}

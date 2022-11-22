
import { requestPort } from '../../helpers/port'
import { Server } from './server'
import { beforeAll, afterAll } from 'vitest'
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

	beforeAll(async () => {
		const [ port, release ] = await requestPort()
		releasePort = release

		await server.listen(port)
		await server.wait()

		const client = server.getClient()
		const definitions = await loadDefinitions(path)

		await migrate(client, definitions)
		await runSeed(client, seed)
	}, timeout)

	afterAll(async () => {
		await server.kill()
		await releasePort()
	}, timeout)

	return server
}

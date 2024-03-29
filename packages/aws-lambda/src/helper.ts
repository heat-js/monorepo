
export const test = () => {
	return !!(
		process.env.TEST ||
		process.env.JEST_WORKER_ID ||
		process.env.VITEST_WORDER_ID
	)
}

export const cachedClient = <Client, Config>(factory: (config:Config) => Promise<Client>) => {
	let client:Promise<Client>

	return (config:Config): Promise<Client> => {
		if(!client) {
			client = factory(config)
		}

		return client
	}
}


export const test = () => {
	return !!(
		process.env.TEST ||
		process.env.JEST_WORKER_ID ||
		process.env.VITEST_WORDER_ID
	)
}

export const serviceName = (service:string|undefined, name:string) => {
	return service ? `${service}__${name}` : name
}

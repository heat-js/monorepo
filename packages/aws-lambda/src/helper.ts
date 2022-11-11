
export const test = () => {
	// console.log(process.env.VITEST_WORDER_ID);

	return !!(
		process.env.TEST ||
		process.env.JEST_WORKER_ID ||
		process.env.VITEST_WORDER_ID
		// process.env.TESTING
	)
}

export const serviceName = (service:string|undefined, name:string) => {
	return service ? `${service}__${name}` : name;
}


export const test = () => {
	return !!(
		process.env.JEST_WORKER_ID ||
		process.env.TESTING
	)
}

export const serviceName = (service:string|undefined, name:string) => {
	return service ? `${service}__${name}` : name;
}

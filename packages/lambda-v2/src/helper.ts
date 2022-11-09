
export const test = () => {
	return !!(
		process.env.JEST_WORKER_ID ||
		process.env.TESTING
	)
}

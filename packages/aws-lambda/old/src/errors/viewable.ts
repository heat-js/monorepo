const prefix = '[viewable]'

export class ViewableError extends Error {
	readonly name = 'ViewableError'

	constructor(type: string, message: string, data?: any) {
		super(
			`${prefix} ${JSON.stringify({
				type,
				message,
				data
			})}`
		)
	}
}

export const isViewableError = (error: Error): boolean => {
	return (
		error instanceof ViewableError || isViewableErrorString(error.message)
	)
}

export const isViewableErrorString = (value: string) => {
	return 0 === value.indexOf(prefix)
}

export const parseViewableErrorString = (value: string) => {
	const json = value.substring(prefix.length)
	return JSON.parse(json)
}

export const getViewableErrorData = (error: ViewableError): string => {
	if (0 === error.message.indexOf(prefix)) {
		return parseViewableErrorString(error.message)
	}

	return error.message
}


import { Bugsnag } from './bugsnag.js'
import { test } from '../../helper.js'
import { ViewableError } from '../../errors/viewable.js'
import { Next, Request } from '../../types.js'

interface BugsnagOptions {
	apiKey?: string
	logViewableErrors?: boolean
}
/**
 * Middleware for logging errors into Bugsnag
 * @param apiKey - The bugsnag api key. Default is `process.env.BUGSNAG_API_KEY`
 * @param logViewableErrors - Log viewable errors. Default is `true`
 */
export const bugsnag = ({ apiKey = process.env.BUGSNAG_API_KEY, logViewableErrors = false }:BugsnagOptions = {}) => {
	const client = new Bugsnag(apiKey || '')

	return async (app:Request, next:Next) => {
		app.log = (error:any, extraData:object = {}) => {
			if(test()) {
				return next()
			}

			console.error(error)

			return client.notify(error, {
				metaData: {
					input: app.input as any,
					errorData: error.metadata || error.metaData,
					extraData,
				}
			})
		}

		return timeout(app, wrapper(app, next, logViewableErrors))()
	}
}

const wrapper = (app:Request, next:Next, logViewableErrors:boolean) => {
	return async () => {
		try {
			return await next()
		} catch (error) {
			if(logViewableErrors || !(error instanceof ViewableError)) {
				await app.log(error)
			}

			throw error
		}
	}
}

class TimeoutError extends Error {
	constructor(remainingTime:number) {
		super(`Lambda will timeout in ${remainingTime}ms`)
	}
}

const timeout = (app:Request, next:Next) => {
	return async () => {
		if(test() || !app.context) {
			return next()
		}

		const content = app.context
		const delay = content.getRemainingTimeInMillis() - 1000
		const id = setTimeout(() => {
			const remaining = content.getRemainingTimeInMillis()
			app.log(new TimeoutError(remaining))
		}, delay)

		try {
			return await next()
		} finally {
			clearTimeout(id)
		}
	}
}

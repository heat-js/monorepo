
import { Bugsnag } from './bugsnag'

import { IApp } from '../../app'
import { Next } from '../../compose'
import { test } from '../../helper'
import { ViewableError } from '../../errors/viewable'

interface BugsnagOptions {
	apiKey?:string
}

export const bugsnag = ({ apiKey = process.env.BUGSNAG_API_KEY }:BugsnagOptions = {}) => {
	const client = new Bugsnag(apiKey)

	return async (app:IApp, next:Next) => {
		app.$.log = () => {
			return (error, extraData:object = {}) => {
				if(test()) {
					return next()
				}

				console.error(error)

				return client.notify(error, {
					metaData: {
						input: app.input,
						errorData: error.metadata || error.metaData,
						extraData,
					}
				})
			}
		}

		return timeout(app, wrapper(app, next))()
	}
}

const wrapper = (app, next) => {
	return async () => {
		try {
			await next()
		} catch (error) {
			if(!(error instanceof ViewableError)) {
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

const timeout = (app, next) => {
	return async () => {
		if(test()) {
			return next()
		}

		const delay = app.context.getRemainingTimeInMillis() - 1000
		const id = setTimeout(() => {
			const remaining = app.context.getRemainingTimeInMillis()
			app.log(new TimeoutError(remaining))
		}, delay)

		try {
			await next()
		} finally {
			clearTimeout(id)
		}
	}
}


import { Bugsnag } from './bugsnag.js'
import { test } from '../../helper.js'
import { ExtraMetaData } from '../../types.js'

interface BugsnagOptions {
	apiKey?: string
}

/**
 * Middleware for logging errors into Bugsnag
 * @param apiKey - The bugsnag api key. Default is `process.env.BUGSNAG_API_KEY`
 */
export const bugsnag = ({ apiKey = process.env.BUGSNAG_API_KEY }:BugsnagOptions = {}) => {
	const client = new Bugsnag(apiKey || '')

	return async (error:any, metaData:ExtraMetaData = {}) => {
		if(test()) {
			return
		}

		await client.notify(error, {
			metaData: {
				errorData: error.metadata || error.metaData || undefined,
				...metaData,
			}
		})
	}
}

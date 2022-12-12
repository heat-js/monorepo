
import { IApp } from '../../app'
import { Next } from '../../compose'

interface IConfiguration {
	(): object
}

/**
 * Middleware for defining your app config.
 * @param configuration - A callback to generate the config object.
 */
export const config = (configuration: IConfiguration) => {
	return async (app: IApp, next: Next) => {
		app.$.config = () => {
			return configuration()
		}

		await next()
	}
}

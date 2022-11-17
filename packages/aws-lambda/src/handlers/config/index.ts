
import { IApp } from '../../app'
import { Next } from '../../compose'

interface IConfiguration {
	(): object
}

export const config = (configuration: IConfiguration) => {
	return async (app: IApp, next: Next) => {
		app.$.config = () => {
			return configuration()
		}

		await next()
	}
}

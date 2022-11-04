
import { App } from '../../app'
import { Next } from '../../compose'

interface IConfiguration {
	(env: EnvParser): object
}

export const config = (configuration: IConfiguration) => {
	return async (app: App, next: Next) => {
		app.$.config = () => {
			const helper = new EnvParser(process.env);
			return configuration(helper);
		}

		await next();
	}
}

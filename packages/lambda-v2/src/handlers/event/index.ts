
import { App } from '../../app'
import { Next } from '../../compose'

export const event = (eventName) => {
	return async (app: App, next: Next) => {
		app.handle.emit(eventName, app);

		await next();
	}
}

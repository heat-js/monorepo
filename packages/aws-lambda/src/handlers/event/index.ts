
import { IApp } from '../../app'
import { Next } from '../../compose'

export const event = (eventName) => {
	return async (app: IApp, next: Next) => {
		app.handle.emit(eventName, app);

		await next();
	}
}

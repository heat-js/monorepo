
import { Next, Request } from '../../types.js'

export const event = (eventName:string) => {
	return (request: Request, next: Next) => {
		request.emit(eventName, request)

		return next()
	}
}

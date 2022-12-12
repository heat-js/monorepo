
import { Next, Request } from '../../types'

export const event = (eventName:string) => {
	return (request: Request, next: Next) => {
		request.emit(eventName, request)

		return next()
	}
}

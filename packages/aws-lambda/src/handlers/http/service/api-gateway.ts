
import { IApp } from '../../app'
import { Next } from '../../compose'
import { Request } from '../request'
import { Response } from '../response'

export const elb = () => {
	return async (app: IApp, next: Next) => {
		app.$.request = (): Request => {
			const input = app.input;

			return Object.freeze({
				headers:	input.headers,
				method:		input.httpMethod.toUpperCase(),
				params:		input.pathParameters,
				query:		input.queryStringParameters,
				path:		input.path,
				body:		input.body,
				ip:			input.requestContext.identity.sourceIp,
			});
		}

		await next();

		const response:Response = app.response.format();

		app.output = {
			isBase64Encoded: 	false,
			statusCode:			response.status,
			headers:			response.headers,
			body:				response.body,
		}
	}
}

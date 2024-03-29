
import { IApp } from '../../../app'
import { Next } from '../../../compose'
import { Request } from '../request'

export const elb = () => {
	return async (app: IApp, next: Next) => {
		app.$.request = (): Request => {
			const input = app.input

			return Object.freeze({
				headers: input.headers,
				method: input.httpMethod.toUpperCase(),
				params: input.pathParameters,
				query: input.queryStringParameters,
				path: input.path,
				body: input.body,
				ip: input.requestContext.identity.sourceIp,
			})
		}

		await next()
	}
}


// import ViewableError from '../error/viewable-error'

// export default class ELB

// 		app.request = Object.freeze Object.assign {}, app.input
// 		app.statusCode = 200
// 		app.headers = {
// 			'content-type':					'application/json'
// 			'access-control-allow-origin':	'*'
// 			'access-control-allow-headers': 'content-type, content-length'
// 			'access-control-allow-methods': 'POST, GET, OPTIONS'
// 		}

// 		fallback = (name, callback) ->
// 			if app.has name
// 				return app.get name

// 			return callback

// 		formatBodyRequest = fallback 'formatBodyRequest', (body) ->
// 			return JSON.parse body

// 		formatBodyResponse = fallback 'formatBodyResponse', (body) ->
// 			return JSON.stringify body

// 		formatErrorResponse = fallback 'formatErrorResponse', (error) =>
// 			if @isViewableError error
// 				return {
// 					statusCode:	error.code or 400
// 					headers:	app.headers
// 					body:		JSON.stringify @viewableErrorResponse error
// 				}

// 			return {
// 				statusCode: 500
// 				headers: app.headers
// 				body: JSON.stringify {
// 					message: 'Internal server error'
// 				}
// 			}

// 		if app.request.body
// 			try
// 				app.input = formatBodyRequest app.request.body

// 			catch error
// 				return app.output = formatErrorResponse new ViewableError 'Invalid request body'
// 		else
// 			app.input = {}

// 		app.input = {
// 			...( app.request.queryStringParameters or {} )
// 			...( app.input or {} )
// 		}

// 		try
// 			await next()

// 		catch error
// 			if not @isViewableError error
// 				console.error error
// 				await app.log error

// 			return app.output = formatErrorResponse error

// 		body = if app.has 'output' then app.output else {}

// 		return app.output = {
// 			statusCode:	app.statusCode
// 			headers:	app.headers
// 			body:		formatBodyResponse body
// 		}

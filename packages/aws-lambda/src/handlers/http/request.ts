
export type Request = {
	readonly headers: Map<string, [ string ]>
	// private url: URL;
	readonly path: string
	readonly method: string
	readonly ip: string
	readonly query: { [key: string]: string }
	readonly params: { [key: string]: string }
	readonly body: any
}


// import ViewableError from '../error/viewable-error'

// export default class ApiGateway

// 	formatErrorMessage: (message) ->
// 		search = '[viewable] '
// 		if 0 is message.indexOf search
// 			return message.slice search.length

// 		return message

// 	handle: (app, next) ->

// 		app.request = ->
// 			return Request.fromApiGateway app.input

// 		app.response = ->
// 			return new Response app.request

// 		try
// 			await next()

// 		catch error
// 			if error instanceof ViewableError
// 				app.response
// 					.status error.status or 400
// 					.json { message: @formatErrorMessage error.message }

// 			else if process.env.DEBUG
// 				throw error

// 			else
// 				# Log error in CloudWatch
// 				console.error error

// 				# Log error in BugSnag
// 				if app.has 'notify'
// 					await app.notify error

// 				app.response.status 500
// 				app.response.json {
// 					message: 'Internal server error'
// 				}

// 		app.output = app.response.toApiGatewayResponse()

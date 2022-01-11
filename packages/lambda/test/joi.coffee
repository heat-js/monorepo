
import joi 		from '@hapi/joi'
import handle 	from '../src/handle'
import Joi 		from '../src/middleware/joi'

describe 'Test Worker Middleware', ->

	it 'should return lowercase username', ->
		lambda = handle(
			(app, next) ->
				app.rules = {
					username: joi.string().max(25).lowercase().required()
				}
				await next()
			new Joi [ 'username' ]
			(app) ->
				app.output = app.input.username
		)

		expect await lambda { username: 'Test' }
			.toBe 'test'

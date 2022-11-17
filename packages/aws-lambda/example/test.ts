
import { handle, event, validate, config, lambda, Lambda, bugsnag, warmer, ssm } from '@heat/lambda'
import { string } from '@heat/aws-lambda/env'
import { object } from 'superstruct'
import { id } from './rules.ts'
import { JsonResponse } from '../src/handlers/http/response'

const configuration = (app) => ({
	key: string('API_KEY')
})

export default handle(
	bugsnag({ apiKey: process.env.BUGSNAG_API_KEY }),
	warmer(),
	validate(object({
		id
	})),

	config(configuration),
	// ssm()
	ssm({
		user: '/path/secret/key',
		pass: '/path/secret/key'
	}),
	lambda(),
	event('before'),

	(app) => {
		app.validate(app.request.body, object({
			id
		}))
	},

	async (app) => {
		const response = await (app.lambda as Lambda).invoke({
			service: 'console',
			name: 'alert',
			payload: {}
		})

		app.output = response

		app.response = new JsonResponse({
			object: 'lol'
		})
	}
)

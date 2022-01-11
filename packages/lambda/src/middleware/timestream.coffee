
import Middleware 		from './abstract'
import TimestreamWrite	from 'aws-sdk/clients/timestreamwrite'
import TimestreamQuery	from 'aws-sdk/clients/timestreamquery'

export default class TimestreamMiddleware extends Middleware

	region: (app) ->
		return (
			app.has('config') and
			app.config.aws and
			app.config.aws.region
		) or (
			process.env.AWS_REGION
		) or (
			'eu-west-1'
		)

	handle: (app, next) ->

		app.timestreamWriter = =>
			return new TimestreamWrite {
				apiVersion: '2018-11-01'
				region: 	@region app
			}

		app.timestreamReader = =>
			return new TimestreamQuery {
				apiVersion: '2018-11-01'
				region: 	@region app
			}

		await next()

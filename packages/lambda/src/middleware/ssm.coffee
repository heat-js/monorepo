
import Middleware 		from './abstract'
import SSM 				from 'aws-sdk/clients/ssm'

export default class SsmMiddleware extends Middleware

	constructor: (@saveInMemory = true) ->
		super()

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
		app.ssm = =>
			return new SSM {
				apiVersion: '2014-11-06'
				region: 	@region app
			}

		if @saveInMemory and @promise
			await @promise
			return next()

		@promise = @resolveSsmValues process.env, app.ssm
		env = await @promise

		Object.assign process.env, env
		await next()

	resolveSsmValues: (input, client) ->
		paths = @getSsmPaths input
		names = paths.map (i) -> i.path

		if !names.length
			return

		chunkedNames = @chunkArray names, 10
		values = await Promise.all chunkedNames.map (names) =>
			params = {
				Names: names
				WithDecryption: true
			}

			result = await client.getParameters(params).promise()

			if result.InvalidParameters and result.InvalidParameters.length
				throw new Error "SSM parameter(s) not found - ['ssm:#{
					result.InvalidParameters.join "', 'ssm:"
				}']"

			return @parseValues result.Parameters

		values = @mergeObjects values

		output = {}
		for item in paths
			output[item.key] = values[item.path]

		return output

	chunkArray: (array, size = 10) ->
		i = 0
		newArray = []
		while i < array.length
			newArray.push array.slice i, i + size
			i += size

		return newArray

	mergeObjects: (array) ->
		merged = {}
		for object in array
			Object.assign merged, object

		return merged

	flattenArray: (array) ->
		return Array.prototype.concat.apply [], array

	parseValues: (params) ->
		values = {}

		for item in params
			if item.Type is 'StringList'
				values[item.Name] = item.Value.split ','
			else
				values[item.Name] = item.Value

		return values

	getSsmPaths: (object) ->
		list = []

		for key, value of object
			if value.substr(0, 4) is 'ssm:'
				path = value.substr 4
				if path[0] isnt '/'
					path = '/' + path

				list.push {
					path
					key
				}

		return list

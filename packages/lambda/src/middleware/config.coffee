
import Middleware 		from './abstract'
import { EnvParser } 	from '../env-parser'

export default class Config extends Middleware

	constructor: (@configBuilder) ->
		super()

	handle: (app, next) ->

		helper = new EnvParser process.env

		if @configBuilder
			config = @configBuilder helper
		else
			config = {}

		app.value 'config',	config

		await next()

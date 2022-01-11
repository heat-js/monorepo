
import Middleware 	from './abstract'
import knex 		from 'knex'

export default class Knex extends Middleware

	handle: (app, next) ->

		db = null
		app.knex = ->
			db = knex app.config.knex
			return db

		try
			await next()

		catch error
			await @destroy db
			throw error

		await @destroy db

	destroy: (db) ->
		if db
			await db.destroy()

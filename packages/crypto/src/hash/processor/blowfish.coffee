
import bcrypt from 'bcrypt'

export default class Blowfish

	constructor: (@saltRounds) ->

	compare: (payload, hash) ->
		return bcrypt.compareSync payload, hash

	hash: (payload) ->
		salt = bcrypt.genSaltSync @saltRounds
		hash = bcrypt.hashSync payload, salt

		return hash

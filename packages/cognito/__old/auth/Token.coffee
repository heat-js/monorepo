
import decode from 'jwt-decode'

export default class Token

	@fromString: (string) ->
		return new Token string, decode string

	constructor: (@jwt, @payload) ->
		@expiration = @payload.exp
		@issuedAt	= @payload.iat

	toString: ->
		return @jwt

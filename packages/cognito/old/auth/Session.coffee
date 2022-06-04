
export default class Session

	constructor: ({ @idToken, @accessToken, @refreshToken, @clockDrift }) ->
		@clockDrift = if typeof @clockDrift isnt 'undefined' then @clockDrift else @calculateClockDrift()

	calculateClockDrift: ->
		now = Math.floor Date.now() / 1000
		iat = Math.min @accessToken.issuedAt, @idToken.issuedAt

		return now - iat

	isValid: ->
		now			= Math.floor Date.now() / 1000
		adjusted	= now - @clockDrift

		return (
			adjusted < @accessToken.expiration and
			adjusted < @idToken.expiration
		)

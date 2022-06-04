
import Token		from './Token.coffee'
import Session		from './Session.coffee'
import Unauthorized from './error/Unauthorized'

# console.log Unauthorized

export default class Auth

	constructor: ({ @store, @client }) ->

	# clearUserCache: ->
	# 	@store.remove 'username'

	clearTokenCache: ->
		@store.remove "token"

	clearDeviceCache: ->
		@store.remove "device"

	session: ->
		token = @store.get 'token'
		if not token
			throw new Unauthorized 'No user logged in'

		session = new Session {
			idToken:		Token.fromString token.id
			accessToken:	Token.fromString token.access
			refreshToken:	token.refresh
			clockDrift:		token.drift
		}

		if session.isValid()
			return session

		return await @_refreshSession()

	refreshSession: ->
		return await @_refreshSession()

	_refreshSession: ->
		token = @store.get 'token'
		if not token
			throw new Unauthorized 'No user logged in'

		device = @store.get 'device'
		if not device
			throw new Unauthorized 'No device'

		try
			result = await @client.refresh(
				token.refresh
				device.key
			)

		catch error
			if error.code is 'NotAuthorizedException'
				@clearTokenCache()

				throw new Unauthorized

			throw error

		session = new Session {
			idToken:		Token.fromString result.IdToken
			accessToken:	Token.fromString result.AccessToken
			refreshToken:	result.RefreshToken
		}

		@store.set 'token', {
			id:			result.IdToken
			access:		result.AccessToken
			refresh:	result.RefreshToken
			drift:		session.clockDrift
		}

		return session

	signIn: (username, password, attributes) ->

		device = @store.get('device') or {}

		try
			result = await @client.signIn(
				username
				password
				attributes
				device.key
				device.group
				device.secret
			)

		catch error
			console.error error

			if error.code is 'ResourceNotFoundException' and error.message.toLowerCase().includes 'device'
				@clearDeviceCache()
				result = await @client.signIn(
					username
					password
					attributes
				)
			else
				throw error

		if result.newDevice
			@store.set 'device', {
				key:	result.newDevice.key
				group:	result.newDevice.group
				secret:	result.newDevice.secret
			}

		session = new Session {
			idToken:		Token.fromString result.idToken
			accessToken:	Token.fromString result.accessToken
			refreshToken:	result.refreshToken
		}

		@store.set 'token', {
			id:			result.idToken
			access:		result.accessToken
			refresh:	result.refreshToken
			drift:		session.clockDrift
		}

		return session

	changePassword: (oldPassword, newPassword) ->
		session = await @session()
		return @client.changePassword(
			oldPassword
			newPassword
			session.accessToken.toString()
		)

	signOut: ->
		try
			session = await @session()
		catch error
			if error instanceof Unauthorized
				@clearTokenCache()
				return

			throw error

		try
			await @client.globalSignOut(
				session.accessToken.toString()
			)
		catch error
			console.log error.code
			if error.code is 'NotAuthorizedException'
				@clearTokenCache()
				return

			throw error

		@clearDeviceCache()
		@clearTokenCache()

		# @clearUserCache()

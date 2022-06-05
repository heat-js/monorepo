
# import { SRPClient, calculateSignature, getNowString } from 'amazon-user-pool-srp-client'

import { srp, generateVerifier, generateDeviceSecret } from '$services/cognito'
import ResponseError from './error/ResponseError'

export default class Client

	constructor: ({ @userPoolId, @clientId, @region }) ->
		if @userPoolId.includes '_'
			[ @region, @userPoolId ] = @userPoolId.split '_'

	call: (action, body) ->
		response = await fetch "https://cognito-idp.#{ @region }.amazonaws.com", {
			body: JSON.stringify body
			method: 'POST'
			cache: 'no-cache'
			referrerPolicy: 'no-referrer'
			# referrerPolicy: 'same-origin'
			headers: {
				'Cache-Control': 'max-age=0'
				'Content-Type': 'application/x-amz-json-1.1'
				'X-Amz-Target': "AWSCognitoIdentityProviderService.#{ action }"
				'X-Amz-User-Agent': 'aws-amplify/5.0.4 js'
			}
		}

		result = await response.json()

		if not response.ok
			code = result._type or result.__type
			message = result.message or result._type or result.__type or 'Unknown Cognito Error'

			throw new ResponseError message, code

		return result

	signIn: (username, password, metadata = {}, deviceKey, deviceGroupKey, deviceSecret) ->
		[A, next] = await srp @userPoolId

		params = {
			USERNAME: username
			SRP_A: A
		}

		# if deviceKey
		# 	params.DEVICE_KEY = deviceKey

		{ ChallengeName, ChallengeParameters, Session } = await @call 'InitiateAuth', {
			ClientId: @clientId
			AuthFlow: 'USER_SRP_AUTH'
			ClientMetadata: metadata
			AuthParameters: params
		}

		# if ChallengeName is 'PASSWORD_VERIFIER'

		[ signature, timestamp ] = await next(
			ChallengeParameters.USER_ID_FOR_SRP
			password
			ChallengeParameters.SRP_B
			ChallengeParameters.SALT
			ChallengeParameters.SECRET_BLOCK
		)

		responses = {
			PASSWORD_CLAIM_SIGNATURE: signature
			PASSWORD_CLAIM_SECRET_BLOCK: ChallengeParameters.SECRET_BLOCK
			TIMESTAMP: timestamp
			USERNAME: ChallengeParameters.USER_ID_FOR_SRP
		}

		if deviceKey
			responses.DEVICE_KEY = deviceKey

		{ ChallengeName, Session, AuthenticationResult } = await @call 'RespondToAuthChallenge', {
			ChallengeName: 'PASSWORD_VERIFIER'
			ChallengeResponses: responses
			ClientId: @clientId
			ClientMetadata: metadata
			Session
		}

		# console.log ChallengeName

		# ChallengeName: 'DEVICE_SRP_AUTH',
		# ClientId: this.pool.getClientId(),
		# ChallengeResponses: authParameters,
		# ClientMetadata: clientMetadata,
		# Session: this.Session,

		if ChallengeName is 'DEVICE_SRP_AUTH'

			[A, next] = await srp deviceGroupKey

			{ ChallengeName, ChallengeParameters, Session } = await @call 'RespondToAuthChallenge', {
				ChallengeName: 'DEVICE_SRP_AUTH'
				ChallengeResponses: {
					SRP_A: A
					USERNAME: username
					DEVICE_KEY: deviceKey
				}
				ClientId: @clientId
				Session
			}


			[ signature, timestamp ] = await next(
				deviceKey
				deviceSecret
				ChallengeParameters.SRP_B
				ChallengeParameters.SALT
				ChallengeParameters.SECRET_BLOCK
			)

			console.log Session
			console.log deviceKey
			console.log deviceGroupKey
			console.log deviceSecret
			console.log ChallengeParameters.SRP_B
			console.log ChallengeParameters.SALT
			console.log ChallengeParameters.SECRET_BLOCK

			# console.log signature, timestamp

			{ AuthenticationResult } = await @call 'RespondToAuthChallenge', {
				Session
				ChallengeName: 'DEVICE_PASSWORD_VERIFIER'
				ClientId: @clientId
				ChallengeResponses: {
					USERNAME:						username
					PASSWORD_CLAIM_SECRET_BLOCK:	ChallengeParameters.SECRET_BLOCK
					TIMESTAMP:						timestamp
					PASSWORD_CLAIM_SIGNATURE:		signature
					DEVICE_KEY:						deviceKey
				}
			}

		response = {
			idToken:		AuthenticationResult.IdToken
			accessToken:	AuthenticationResult.AccessToken
			refreshToken:	AuthenticationResult.RefreshToken
		}

		if AuthenticationResult.NewDeviceMetadata
			key			= AuthenticationResult.NewDeviceMetadata.DeviceKey
			group		= AuthenticationResult.NewDeviceMetadata.DeviceGroupKey
			secret		= generateDeviceSecret()
			userAgent	= if typeof(navigator) isnt 'undefined' then navigator.userAgent else 'nodejs'

			[ verifier, salt ] = await generateVerifier group, key, secret

			result = await @call 'ConfirmDevice', {
				DeviceKey:		key
				DeviceName:		userAgent
				AccessToken:	response.accessToken
				DeviceSecretVerifierConfig: {
					Salt:				salt
					PasswordVerifier:	verifier
				}
			}

			return {
				...response
				newDevice: {
					key
					group
					secret
				}
			}

		return response

	refresh: (refreshToken, deviceKey) ->
		result = await @call 'InitiateAuth', {
			ClientId: @clientId
			AuthFlow: 'REFRESH_TOKEN_AUTH'
			AuthParameters: {
				DEVICE_KEY: deviceKey
				REFRESH_TOKEN: refreshToken
			}
		}

		return {
			...result.AuthenticationResult
			RefreshToken: result.AuthenticationResult.RefreshToken or refreshToken
		}

	signUp: (username, password, attributes) ->
		return @call 'SignUp', {
			ClientId: @clientId
			Username: username
			Password: password
			UserAttributes: Object.entries(attributes).map ([ key, value ]) -> {
				Name: key
				Value: value
			}
		}

	# confirmDevice: ({ accessToken, deviceKey, userAgent, salt, verifier }) ->
	# 	return @call 'ConfirmDevice', {
	# 		DeviceKey:		deviceKey
	# 		DeviceName:		userAgent
	# 		AccessToken:	accessToken
	# 		DeviceSecretVerifierConfig: {
	# 			Salt:				salt
	# 			PasswordVerifier:	verifier
	# 		}
	# 	}

	globalSignOut: (accessToken) ->
		return @call 'GlobalSignOut', {
			AccessToken: accessToken
		}

	changePassword: (oldPass, newPass, accessToken) ->
		return @call 'ChangePassword', {
			PreviousPassword: oldPass
			ProposedPassword: newPass
			AccessToken: accessToken
		}

	resendConfirmationCode: (username) ->
		return @call 'ResendConfirmationCode', {
			ClientId: @clientId
			Username: username
		}

	confirmSignUp: (username, code, forceAliasCreation) ->
		return @call 'ConfirmSignUp', {
			ClientId:			@clientId
			Username:			username
			ConfirmationCode:	code
			ForceAliasCreation: forceAliasCreation
		}

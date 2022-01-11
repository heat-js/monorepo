
import jwt				from 'jsonwebtoken'
import JwksClient		from 'jwks-rsa'
import ViewableError	from '../error/viewable-error'

export default class CognitoAuthentication

	verify: (token) ->
		region		= process.env.AWS_REGION
		userPool	= process.env.USER_POOL
		clientId	= process.env.CLIENT_ID

		return new Promise (resolve, reject) ->
			jwt.verify(
				token
				(header, callback) ->
					client = new JwksClient {
						jwksUri: "https://cognito-idp.#{ region }.amazonaws.com/#{ userPool }/.well-known/jwks.json"
					}

					client.getSigningKey header.kid, (error, key) ->
						if error
							callback error
						else
							callback null, key.publicKey or key.rsaPublicKey
				{
					audience: clientId
					issuer:	"https://cognito-idp.#{ region }.amazonaws.com/#{ userPool }"
					algorithm: 'RS256'
				}
				(error, decoded) ->
					if error
						reject error
					else
						resolve decoded
			)

	handle: (app, next) ->
		if process.env.JEST_WORKER_ID or process.env.TESTING
			await next()
			return

		token = app.request.headers.authorization or app.input.token

		try
			app.token = await @verify token

		catch error
			console.error error
			throw new ViewableError 'Unauthorized'

		name	= app.token['cognito:username']
		id		= app.token['sub']

		if not name or not id
			throw new ViewableError 'Unauthorized'

		delete app.input.token

		app.user = {
			name
			id
		}

		await next()

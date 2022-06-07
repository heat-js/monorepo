
import ResponseError from './error/response-error.js'

export class Client {
	constructor({ userPoolId, clientId, region }) {
		this.clientId = clientId;

		if (userPoolId.includes('_')) {
			const [r, p] = userPoolId.split('_');
			this.userPoolId = p;
			this.region = r;
		} else {
			this.userPoolId = userPoolId;
			this.region = region;
		}
	}

	getUserPoolId() {
		return this.userPoolId;
	}

	getClientId() {
		return this.clientId;
	}

	getRegion() {
		return this.region;
	}

	async call(action, params) {
		const response = await fetch(`https://cognito-idp.${this.region}.amazonaws.com`, {
			body: JSON.stringify(params),
			method: 'POST',
			cache: 'no-cache',
			referrerPolicy: 'no-referrer',
			headers: {
				'Cache-Control': 'max-age=0',
				'Content-Type': 'application/x-amz-json-1.1',
				'X-Amz-Target': `AWSCognitoIdentityProviderService.${action}`,
				'X-Amz-User-Agent': '@heat/cognito',
				// 'X-Amz-User-Agent': 'aws-amplify/5.0.4 js',
			}
		});

		const result = await response.json();

		// console.log(result);

		if (!response.ok) {
			const code = result._type || result.__type;
			const message = result.message || code || 'Unknown Cognito Error';

			throw new ResponseError(message, code);
		}

		return result;
	}
}


import ResponseError from './error/response-error.js'

export class Client {
	constructor({ userPoolId, clientId, region, store, deviceStore }) {
		this.clientId = clientId;
		this.store = store;
		this.deviceStore = deviceStore;

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

	getStore() {
		return this.store;
	}

	getDeviceStore() {
		return this.deviceStore;
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
			}
		});

		const result = await response.text();
		const data = result ? JSON.parse(result) : {};

		if (!response.ok) {
			const code = data._type || data.__type;
			const message = data.message || code || 'Unknown Cognito Error';

			throw new ResponseError(message, code);
		}

		return data
	}
}

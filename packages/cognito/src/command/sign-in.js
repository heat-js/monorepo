import { getUserDevice, removeUserDevice, setUserDevice } from "../helper/device.js";
import { Session } from "../session.js";
import { generateDeviceSecret, generateVerifier, srp } from "../srp.js";
import { Token } from "../token.js";

export const signInCommand = async ({ client, store, deviceStore, username, password, attributes = {} }) => {

	const device = getUserDevice({ store, deviceStore, username });

	var result;

	try {
		result = await userAuth({
			client,
			device,
			username,
			password,
			attributes
		});
	} catch (error) {
		if (error.code === 'ResourceNotFoundException' && error.message.toLowerCase().includes('device')) {

			removeUserDevice({ store, deviceStore, username });

			result = await userAuth({
				client,
				device: {},
				username,
				password,
				attributes
			});
		} else {
			throw error;
		}
	}

	const data = result.AuthenticationResult;
	const idToken = Token.fromString(data.IdToken);
	const accessToken = Token.fromString(data.AccessToken);
	const refreshToken = data.RefreshToken;
	const newDevice = data.NewDeviceMetadata;
	const session = new Session({ idToken, accessToken });

	if (newDevice) {
		await confirmDevice({
			client,
			store,
			deviceStore,
			username,
			accessToken,
			key: newDevice.DeviceKey,
			group: newDevice.DeviceGroupKey,
		});
	}

	store.set('token', {
		id: idToken.toString(),
		access: accessToken.toString(),
		refresh: refreshToken,
		drift: session.clockDrift,
	});

	return session;
};

const userAuth = async ({ client, device, username, password, attributes }) => {
	const result = await userSrpAuth({
		client,
		device,
		username,
		password,
		attributes,
	});

	if (result.ChallengeName === 'DEVICE_SRP_AUTH') {
		return deviceSrpAuth({
			client,
			device,
			username,
			session: result.Session
		});
	}

	return result;
};

const userSrpAuth = async ({ client, device, username, password, attributes }) => {
	const [A, next] = await srp(client.getUserPoolId());

	const params = {
		USERNAME: username,
		SRP_A: A,
	}

	if (device.key) {
		params.DEVICE_KEY = device.key;
	}


	const result = await client.call('InitiateAuth', {
		ClientId: client.getClientId(),
		AuthFlow: 'USER_SRP_AUTH',
		ClientMetadata: attributes,
		AuthParameters: params,
	});

	if (result.ChallengeName === 'PASSWORD_VERIFIER') {
		const [signature, timestamp] = await next(
			result.ChallengeParameters.USER_ID_FOR_SRP,
			password,
			result.ChallengeParameters.SRP_B,
			result.ChallengeParameters.SALT,
			result.ChallengeParameters.SECRET_BLOCK,
		);

		const responses = {
			USERNAME: result.ChallengeParameters.USER_ID_FOR_SRP,
			TIMESTAMP: timestamp,
			PASSWORD_CLAIM_SIGNATURE: signature,
			PASSWORD_CLAIM_SECRET_BLOCK: result.ChallengeParameters.SECRET_BLOCK,
		};

		if (device.key) {
			responses.DEVICE_KEY = device.key;
		}

		return client.call('RespondToAuthChallenge', {
			ChallengeName: 'PASSWORD_VERIFIER',
			ChallengeResponses: responses,
			ClientId: client.getClientId(),
			ClientMetadata: attributes,
			Session: result.Session,
		});
	}

	return result;
};

const deviceSrpAuth = async ({ client, device, username, session }) => {
	const [A, next] = await srp(device.group);

	const result = await client.call('RespondToAuthChallenge', {
		Session: session,
		ClientId: client.getClientId(),
		ChallengeName: 'DEVICE_SRP_AUTH',
		ChallengeResponses: {
			SRP_A: A,
			USERNAME: username,
			DEVICE_KEY: device.key,
		}
	});

	const [signature, timestamp] = await next(
		device.key,
		device.secret,
		result.ChallengeParameters.SRP_B,
		result.ChallengeParameters.SALT,
		result.ChallengeParameters.SECRET_BLOCK,
	);

	return client.call('RespondToAuthChallenge', {
		Session: result.Session,
		ClientId: client.getClientId(),
		ChallengeName: 'DEVICE_PASSWORD_VERIFIER',
		ChallengeResponses: {
			USERNAME: username,
			DEVICE_KEY: device.key,
			TIMESTAMP: timestamp,
			PASSWORD_CLAIM_SIGNATURE: signature,
			PASSWORD_CLAIM_SECRET_BLOCK: result.ChallengeParameters.SECRET_BLOCK,
		}
	});
}

const confirmDevice = async ({ client, store, deviceStore, username, accessToken, key, group }) => {
	const secret = generateDeviceSecret();
	const name = typeof (navigator) !== 'undefined' ? navigator.userAgent : 'nodejs';

	const [verifier, salt] = await generateVerifier(group, key, secret);

	await client.call('ConfirmDevice', {
		DeviceKey: key,
		DeviceName: name,
		AccessToken: accessToken.toString(),
		DeviceSecretVerifierConfig: {
			Salt: salt,
			PasswordVerifier: verifier,
		}
	});

	const device = {
		key,
		group,
		secret,
	};

	setUserDevice({ store, deviceStore, username, device });
};


export const generateRandomBuffer = (numBytes) => {
	const u8 = new Uint8Array(numBytes);
	crypto.getRandomValues(u8);
	return u8.buffer;
};

export const hkdf = async (algorithm, ikm, salt, info, keylen) => {
	const cryptoKey = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
	const params = {
		name: 'HKDF',
		hash: algorithm,
		salt,
		info
	};

	const bytes = await crypto.subtle.deriveBits(params, cryptoKey, keylen);
	return new Uint8Array(bytes);
};

export const hash = (algorithm, message) => {
	return crypto.subtle.digest(algorithm, message);
};

export const hmac = async (algorithm, message, key) => {
	const cryptoKey = await crypto.subtle.importKey(
		'raw',
		key,
		{ name: 'HMAC', hash: { name: algorithm } },
		false,
		['sign']
	);

	return crypto.subtle.sign('HMAC', cryptoKey, message);
};

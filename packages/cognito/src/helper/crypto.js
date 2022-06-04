
import { toBigInt, fromUtf8 } from './encoding.js';
import { webcrypto } from 'crypto';

// const g = Function('return this')() || (42, eval)('this');
// const webcrypto = g.crypto || g.msCrypto || import('crypto').webcrypto;

export const BASE_32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export const BASE_58 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz234567';

export const randomBytes = (array) => {
	return webcrypto.getRandomValues(array);
}

export const generateRandomBigInt = (numBytes = 16) => {
	return toBigInt(generateRandomBuffer(numBytes));
}

export const generateRandomString = (length, chars = BASE_32) => {
	const max = chars.length;
	const u32 = new Uint32Array(length);
	randomBytes(u32);

	return Array.from(u32).map((num) => {
		const index = Math.floor(num / (0xffffffff + 1) * max)
		return chars[index];
	}).join('');
}

export const generateRandomBuffer = (numBytes) => {
	const u8 = new Uint8Array(numBytes);
	randomBytes(u8);
	return u8.buffer;
};

export const hkdf = async (algorithm, ikm, salt, info, keylen) => {
	const cryptoKey = await webcrypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
	const params = {
		name: 'HKDF',
		hash: algorithm,
		salt,
		info
	};

	const bytes = await webcrypto.subtle.deriveBits(params, cryptoKey, keylen);
	return new Uint8Array(bytes);
};

export const hash = (algorithm, message) => {
	if (typeof message === 'string') {
		message = fromUtf8(message);
	}

	return webcrypto.subtle.digest(algorithm, message);
};

export const hmac = async (algorithm, message, key) => {
	if (typeof key === 'string') {
		key = fromUtf8(key);
	}

	if (typeof message === 'string') {
		message = fromUtf8(message);
	}

	const cryptoKey = await webcrypto.subtle.importKey(
		'raw',
		key,
		{ name: 'HMAC', hash: { name: algorithm } },
		false,
		['sign']
	);

	return webcrypto.subtle.sign('HMAC', cryptoKey, message);
};
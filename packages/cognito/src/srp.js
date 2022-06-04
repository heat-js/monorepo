
import { hash, hmac, hkdf, generateRandomBigInt, generateRandomBuffer } from './helper/crypto.js'
import { toBigInt, fromBigInt, fromBase64, toBase64, fromUtf8, padHex, fromHex } from './helper/encoding.js';
import concat from 'array-buffer-concat';
import { modPow } from '@magic-akari/modpow';

const ZERO = BigInt(0);
const initN = '' +
	'FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD1' +
	'29024E088A67CC74020BBEA63B139B22514A08798E3404DD' +
	'EF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245' +
	'E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7ED' +
	'EE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3D' +
	'C2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F' +
	'83655D23DCA3AD961C62F356208552BB9ED529077096966D' +
	'670C354E4ABC9804F1746C08CA18217C32905E462E36CE3B' +
	'E39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9' +
	'DE2BCBF6955817183995497CEA956AE515D2261898FA0510' +
	'15728E5A8AAAC42DAD33170D04507A33A85521ABDF1CBA64' +
	'ECFB850458DBEF0A8AEA71575D060C7DB3970F85A6E1E4C7' +
	'ABF5AE8CDB0933D71E8C94E04A25619DCEE3D2261AD2EE6B' +
	'F12FFA06D98A0864D87602733EC86A64521F2B18177B200C' +
	'BBE117577A615D6C770988C0BAD946E208E24FA074E5AB31' +
	'43DB5BFCE0FD108E4B82D120A93AD2CAFFFFFFFFFFFFFFFF';

const hashHex = function (str) {
	return hash('SHA-256', fromBigInt(str));
};

export const srp = async (group, smallAValue = undefined) => {
	const N = BigInt('0x' + initN);
	const g = BigInt(2);
	const kh = await hashHex('00' + N.toString(16) + '0' + g.toString(16));
	const k = toBigInt(kh);

	const smallA = BigInt(smallAValue || generateRandomBigInt(128) % N);
	const largeA = modPow(g, smallA, N);

	const A = largeA.toString(16);

	if (largeA % N === ZERO) {
		throw new Error('Illegal paramater. A mod N cannot be 0.')
	}

	return [A, async (user, pass, serverB, salt, secretBlock, time = undefined) => {
		const B = BigInt('0x' + serverB);
		const S = BigInt('0x' + salt);

		if (B % N === ZERO) {
			throw new Error('B cannot be zero.');
		}

		const uh = await hashHex(padHex(A) + padHex(B));
		const U = toBigInt(uh);

		if (U === ZERO) {
			throw new Error('U cannot be zero.');
		}

		// const userPass = `${group}${user}:${pass}`;
		// const userPassHash = await hashString(userPass);

		const userPass = fromUtf8(`${group}${user}:${pass}`);
		const userPassHash = await hash('SHA-256', userPass);

		const userPassHex = toBigInt(userPassHash).toString(16);

		const xh = await hashHex(padHex(S) + userPassHex);
		const x = toBigInt(xh);
		const xn = modPow(g, x, N);

		const int = B - (k * xn);

		const s = modPow(int, smallA + (U * x), N) % N;

		const hkdfValue = await hkdf(
			'SHA-256',
			fromBigInt(padHex(s)),
			fromBigInt(padHex(U)),
			fromUtf8('Caldera Derived Key'),
			128,
		);

		const timestamp = time || getNowString();

		const message = concat(
			fromUtf8(group),
			fromUtf8(user),
			fromBase64(secretBlock),
			fromUtf8(timestamp)
		);

		const mac = await hmac('SHA-256', message, hkdfValue);
		const signature = toBase64(mac);

		return [
			signature,
			timestamp,
		];
	}];
}

export const generateVerifier = async (group, user, pass, random = undefined) => {
	const N = BigInt('0x' + initN);
	const g = BigInt(2);

	const combined = fromUtf8(`${group}${user}:${pass}`);
	const hashed = await hash('SHA-256', combined);
	const paddedHash = padHex(toBigInt(hashed).toString(16));
	const salt = padHex(random ? BigInt('0x' + random) : generateRandomBigInt(16).toString(16));

	const saltedHash = await hash('SHA-256', fromBigInt(BigInt('0x' + salt + paddedHash)));
	const verifier = modPow(g, toBigInt(saltedHash), N);

	return [
		toBase64(fromHex(padHex(verifier.toString(16)))),
		toBase64(fromHex(salt.toString(16))),
	];
}

export const generateDeviceSecret = () => {
	return toBase64(generateRandomBuffer(40));
}


const WEEK_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const padTime = (time) => {
	return time < 10 ? ('0' + time) : time
}

const getNowString = () => {
	const now = new Date()
	const weekDay = WEEK_NAMES[now.getUTCDay()]
	const month = MONTH_NAMES[now.getUTCMonth()]
	const day = now.getUTCDate()
	const hours = padTime(now.getUTCHours())
	const minutes = padTime(now.getUTCMinutes())
	const seconds = padTime(now.getUTCSeconds())
	const year = now.getUTCFullYear()
	const dateNow = `${weekDay} ${month} ${day} ${hours}:${minutes}:${seconds} UTC ${year}`; // ddd MMM D HH:mm:ss UTC YYYY
	return dateNow
}


// export const fromBigInt = (n) => {
// 	const hex = n.toString(16);
// 	const arrayBuffer = new ArrayBuffer(Math.ceil(hex.length / 2));
// 	const u8 = new Uint8Array(arrayBuffer);
// 	let offset = 0;
// 	// handle toString(16) not padding
// 	if (hex.length % 2 !== 0) {
// 		u8[0] = parseInt(hex[0], 16);
// 		offset = 1;
// 	}
// 	for (let i = 0; i < arrayBuffer.byteLength; i++) {
// 		u8[i + offset] = parseInt(
// 			hex.slice(2 * i + offset, 2 * i + 2 + offset),
// 			16,
// 		);
// 	}
// 	return arrayBuffer;

// 	// return fromHex(n.toString(16));
// };

export const toBigInt = (buffer) => {
	return BigInt(`0x${toHex(buffer)}`);
};


export const toHex = (buffer) => {
	return Array
		.from(new Uint8Array(buffer))
		.map(b => b.toString(16).padStart(2, '0'))
		.join('');
}

export const fromHex = (hex) => {
	const view = new Uint8Array(hex.length / 2);

	for (let i = 0; i < hex.length; i += 2) {
		view[i / 2] = parseInt(hex.substring(i, i + 2), 16);
	}

	return view.buffer;
}


export function fromUtf8(str) {
	return new TextEncoder('utf-8').encode(str).buffer;
}

// export function toUtf8(str, encoding = 'utf-8') {
// 	return new TextEncoder('utf-8').decode(str);
// }


export const fromBase64 = (base64) => {
	if (typeof (atob) === 'undefined') {
		return Uint8Array.from(Buffer.from(base64, 'base64'));
	}

	return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

export const toBase64 = (buffer) => {
	if (typeof (btoa) === 'undefined') {
		return Buffer.from(buffer, 'binary').toString('base64');
	}

	return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

export const padHex = (bigInt) => {
	const hashStr = bigInt.toString(16);
	if (hashStr.length % 2 === 1) {
		return '0' + hashStr;
	}

	if ('89ABCDEFabcdef'.indexOf(hashStr[0]) !== -1) {
		return '00' + hashStr;
	}

	return hashStr;
};


/**
 * An iterative implementation of the extended euclidean algorithm or extended greatest common divisor algorithm.
 * Take positive integers a, b as input, and return a triple (g, x, y), such that ax + by = g = gcd(a, b).
 *
 * @param a
 * @param b
 *
 * @throws {RangeError}
 * This excepction is thrown if a or b are less than 0
 *
 * @returns A triple (g, x, y), such that ax + by = g = gcd(a, b).
 */
export function eGcd(a, b) {
	if (typeof a === 'number') a = BigInt(a)
	if (typeof b === 'number') b = BigInt(b)

	if (a <= 0n || b <= 0n) throw new RangeError('a and b MUST be > 0') // a and b MUST be positive

	let x = 0n
	let y = 1n
	let u = 1n
	let v = 0n

	while (a !== 0n) {
		const q = b / a
		const r = b % a
		const m = x - (u * q)
		const n = y - (v * q)
		b = a
		a = r
		x = u
		y = v
		u = m
		v = n
	}
	return {
		g: b,
		x: x,
		y: y
	}
}

export function modInv(a, n) {
	const egcd = eGcd(toZn(a, n), n)
	if (egcd.g !== 1n) {
		throw new RangeError(`${a.toString()} does not have inverse modulo ${n.toString()}`) // modular inverse does not exist
	} else {
		return toZn(egcd.x, n)
	}
}

export function abs(a) {
	return (a >= 0) ? a : -a
}

export function toZn(a, n) {
	if (typeof a === 'number') a = BigInt(a)
	if (typeof n === 'number') n = BigInt(n)

	if (n <= 0n) {
		throw new RangeError('n must be > 0')
	}

	const aZn = a % n
	return (aZn < 0n) ? aZn + n : aZn
}


export function modPow(b, e, n) {
	if (typeof b === 'number') b = BigInt(b)
	if (typeof e === 'number') e = BigInt(e)
	if (typeof n === 'number') n = BigInt(n)

	if (n <= 0n) {
		throw new RangeError('n must be > 0')
	} else if (n === 1n) {
		return 0n
	}

	b = toZn(b, n)

	if (e < 0n) {
		return modInv(modPow(b, abs(e), n), n)
	}

	let r = 1n
	while (e > 0) {
		if ((e % 2n) === 1n) {
			r = r * b % n
		}
		e = e / 2n
		b = b ** 2n % n
	}
	return r
}

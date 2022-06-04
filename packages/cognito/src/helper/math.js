
export const modPow = (a, b, n) => {
	let result = 1n;
	let x = a % n;
	while (b > 0n) {
		if (b % 2n === 1n) {
			result *= x;
			result %= n;
		}
		b /= 2n;
		x *= x;
		x %= n;
	}
	return result;
};

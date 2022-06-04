
import Big from '../src/big'

describe('div', () => {
	// const t = (dividend, divisor, expected, decimals = 20) => {
	// 	it(`${dividend} / ${divisor} = ${expected} (dec ${decimals})`, () => {
	// 		Big.setDecimals(decimals);
	// 		const result = new Big(dividend).div(divisor).toString();

	// 		expect(result).toBe(String(expected));
	// 	})
	// };

	it('test', () => {
		// console.log(new Big(1).div(3).mul(3).toString());

		console.log(new Big(1).sub(new Big(1).div(3).mul(2)).toString());
	});
});

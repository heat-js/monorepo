
import { coerce, define, number, string, union, assert } from "superstruct";
import { Big } from 'big.js'

export const big = () => {
	const base = define('big', (value) => {
		try {
			Big(value);
			return true;
		} catch(error) {
			return 'Invalid big number'
		}
	});

	return coerce(base, union([ string(), number(), base]), (value): Big => {
		assert(value, base);
		return Big(value);
	});
};

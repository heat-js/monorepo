
import { rollup } from './rollup';

export const compile = async (input, options = {}) => {
	return rollup(input, {
		external(importee) {
			return importee !== input;
		},
		...options
	});
}

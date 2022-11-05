
import { rollup } from './rollup';

export const bundle = async (input, options = {}) => {
	return rollup(input, {
		external(importee) {
			if (options.includePackages) return false;

			return !['.', '/'].includes(importee[0])
		},
		...options
	});
}

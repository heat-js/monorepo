
import { rollup } from 'rollup'
import { plugins } from './rollup';

export const bundle = async (input, options = {}) => {
	const bundle = await rollup({
		input,
		plugins: [...plugins(options)],

		onwarn(error) {
			if (/external dependency/.test(error.message)) return;
		},
		external(importee) {
			if (options.includePackages)
				return false;

			return !['.', '/'].includes(importee[0])
		}
	});

	const { output } = await bundle.generate({
		format: 'cjs',
	});

	return output[0].code;
}


import { rollup } from 'rollup'
import { plugins } from './rollup';

export const compile = async (input, options = {}) => {
	const bundle = await rollup({
		input,
		plugins: [...plugins(options)],

		onwarn(error) {
			if (/external dependency/.test(error.message)) return;
		},
		external(importee) {
			return importee !== input;
		}
	});

	const { output } = await bundle.generate({
		format: 'cjs',
	});

	return output[0].code;
}


import { rollup } from 'rollup'
import { plugins } from './rollup';

export default async (input, options) => {
	const bundle = await rollup({
		input,
		plugins: [...plugins(options)],

		onwarn(error) {
			if (/external dependency/.test(error.message)) return;
			console.error(error.message);
		},
		external(importee) {
			if (options.includePackages)
				return false;

			return !['.', '/'].includes(importee[0])
		}
	});

	const { output } = await bundle.generate({
		format: 'cjs'
	});

	return output[0];
}






// code = output[0].code

// if options.env and options.env.length > 0
// node = spawn 'env', [...options.env, 'node']
// 	else
// node = spawn 'node'

// node.stdin.write code
// node.stdin.end()

// return node


import { join } from 'path';

/**
 * @param {{
 *   out?: string;
 * }} options
 */
export default function ({ out = 'build' } = {}) {
	/** @type {import('@sveltejs/kit').Adapter} */

	const staticDir = join(out, 'static');
	const lambdaDir = join(out, 'lambda');

	const adapter = {
		name: '@heat/vite-adapter-lambda',

		async adapt(builder) {

			builder.rimraf(out);

			builder.log.minor('Compiling Sveltekit.');

			builder.writeClient(staticDir);
			builder.writePrerendered(staticDir);
			builder.writeServer(lambdaDir);
		},
	};

	return adapter;
};

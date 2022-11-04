
import { createFilter } from 'rollup-pluginutils'
import objectAssign from 'object-assign'
import crypto from 'crypto'

export default (options) => {
	options = objectAssign({
		extensions: ['.coffee', '.litcoffee'],
	}, options || {});

	const filter = createFilter(options.include, options.exclude);

	return {
		transform(code, id) {
			if (!filter(id)) return;
			if (options.extensions.indexOf(extname(id)) === -1) return;

			const hash = crypto
				.createHash('sha1')
				.update(code, 'utf8')
				.digest('hex');

			return {
				code: `export default ${JSON.stringify(code)};\nexport const hash = '${hash}'`,
				map: { mappings: "" }
			};
		}
	};
}

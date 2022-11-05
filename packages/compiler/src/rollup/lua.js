
import { createFilter } from 'rollup-pluginutils'
import objectAssign from 'object-assign'
import crypto from 'crypto'
import { extname } from 'path'

export default (options) => {
	options = objectAssign({
		extensions: ['.lua'],
	}, options || {});

	const filter = createFilter(options.include, options.exclude);

	return {
		transform(code, id) {
			if (!filter(id)) return;
			if (options.extensions.indexOf(extname(id)) === -1) return;

			const minified = code.trim()

			const hash = crypto
				.createHash('sha1')
				.update(minified, 'utf8')
				.digest('hex');

			return {
				code: `export default ${JSON.stringify(minified)};\nexport const hash = '${hash}'`,
				map: { mappings: "" }
			};
		}
	};
}

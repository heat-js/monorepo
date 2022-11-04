
import { createFilter } from 'rollup-pluginutils'
import objectAssign from 'object-assign'
import crypto from 'crypto'

export default (options) => {
	options = objectAssign({
		extensions: [],
	}, options || {});

	const filter = createFilter(options.include, options.exclude);

	return {
		transform(code, id) {
			if (!filter(id)) return;
			if (options.extensions.indexOf(extname(id)) === -1) return;

			return {
				code: `export default ${JSON.stringify(code)};`,
				map: { mappings: "" }
			};
		}
	};
}


import coffee from './coffee.js'
import { extname } from 'path'

const transformers = [
	[['coffee'], coffee],
	[['json'], json],
	[['lua'], lua],
	[['ts'], ts],
	[['jsx', 'js'], jsx],
	[['html', 'md'], raw],
]

export const transform = ({ code, id, sourceMap = true }) => {
	const extension = extname(id);

	for (let [extensions, fn] in transformers) {
		if (extensions.includes(extension)) {
			return fn({ code, id, extension, sourceMap });
		}
	}

	return null;
}

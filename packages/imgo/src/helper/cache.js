import { readFile, writeFile } from "./file.js"
import { createHash } from 'crypto'
import jsonFormat from 'json-format'
import md5 from 'md5-file'

export const getInputCacheKey = async (fileName) => {
	const key = await md5(fileName);
	return key;
}

export const getOutputCacheKey = (image) => {
	const options = { ...image.options };
	delete options.input;

	// return serialize({ options, output: entry.output });
	return serialize(options);
}

const serialize = (value) => {
	const json = JSON.stringify(value);
	return createHash('md5').update(json).digest('hex');
}

export const readCache = async (filePath) => {
	try {
		const json = await readFile(filePath);
		const data = JSON.parse(json);

		return data;
	}
	catch (_) {
		return [];
	}
}

export const writeCache = async (filePath, entries) => {
	const data = entries
		.filter(entry => !entry.failed)
		.map(entry => entry.key);

	await writeFile(filePath, jsonFormat(data));
}

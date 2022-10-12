
import fs from 'fs'
import { join, parse } from 'path'
import { list } from 'recursive-readdir-async'

export const listFiles = async (root, inputDir, extentions) => {
	const files = await list(inputDir);

	return files
		.map(({ fullname }) => parse(fullname))
		.filter(({ ext }) => extentions.includes(ext.substring(1)))
		.map(file => ({
			...file,
			path: join(file.dir, file.base),
			local: file.dir.replace(root, ''),
		}));
}

export const makeDirectory = async (outputDir) => {
	await fs.promises.mkdir(outputDir, {
		recursive: true
	});
}

export const readFile = (filePath) => {
	return fs.promises.readFile(filePath);
}

export const writeFile = (filePath, data) => {
	return fs.promises.writeFile(filePath, data);
}

export const fileExists = async (filePath) => {
	try {
		const stats = await fs.promises.stat(filePath);
		return stats && stats.isFile();
	} catch (error) {
		if (error.code === 'ENOENT') {
			return false;
		}

		throw error;
	}
}


import { join } from 'path'

const defaultConfig = {
	root: process.cwd(),
	cacheFile: './cache.json',
	extentions: ['jpg', 'jpeg', 'png', 'gif', 'avif', 'webp'],
	parallel: 5,
	overwrite: false,
	output: '.build',
};

export const extendConfig = config => {
	return {
		...defaultConfig,
		...config,
		types: [config.types].flat(Infinity),
	}
}

export const loadConfig = async (filePath = './config.imgo.js') => {
	const file = join(process.cwd(), filePath);
	const module = await import(file);

	return module.default;
}


import { optimizeImages, saveImage } from "../helper/image.js"
import { fileExists, listFiles, makeDirectory } from "../helper/file.js"
import { extendConfig } from "../helper/config.js"
import { Task } from "../helper/terminal.js"
import { join } from 'path'
import { getInputCacheKey, getOutputCacheKey, readCache, writeCache } from "../helper/cache.js"
import { assertUniqueInputKeys, assertUniqueOutputKeys } from "../helper/assert.js"
import chalk from 'chalk';

export const optimize = async (config) => {
	config = extendConfig(config);

	const cachePath = join(config.root, config.output, config.cacheFile);
	const inputDir = join(config.root, config.input);

	const cache = await readCache(cachePath);
	const inputs = await listFiles(config.root, inputDir, config.extentions).then(files => {
		return Promise.all(files.map(async file => {
			const inputKey = await getInputCacheKey(file.path);
			return { file, inputKey };
		}))
	});

	const outputs = (await Promise.all(inputs.map(async entry => {
		return optimizeImages(entry.file, config.types).map(({ image, output }) => {
			const outputKey = getOutputCacheKey(image);
			return {
				...entry,
				image,
				output,
				outputKey,
				key: `${entry.inputKey} ${outputKey} ${output}`,
			}
		});
	}))).flat(Infinity);

	assertUniqueInputKeys(inputs);
	assertUniqueOutputKeys(outputs);

	const queue = [...outputs];
	const errors = [];

	let processed = 0;

	await Promise.all(Array.from({ length: config.parallel }).map(async (_, index) => {
		if (!queue.length) return;

		const id = index + 1;
		const task = new Task();

		task.setPrefix(chalk.dim(`[${id}]`));
		task.start();

		try {
			let entry;
			while (entry = queue.shift()) {
				task.setName(entry.output);

				const outputDir = join(config.root, config.output, entry.file.local);
				const outputFile = join(outputDir, entry.output);

				if (!config.overwrite && await fileExists(outputFile) && cache.includes(entry.key)) {
					continue;
				}

				await makeDirectory(outputDir);

				try {
					await saveImage(entry.image, outputFile);
					processed++;
				} catch (error) {
					entry.failed = true;
					error.data = entry;
					errors.push(error);
				}
			}
		}
		catch (error) {
			throw error;
		} finally {
			task.done();
		}
	}));

	await writeCache(cachePath, outputs);

	return {
		errors,
		inputs,
		outputs,
		processed
	}
}

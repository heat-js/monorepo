
import { ValidationError } from "./errors.js";
import { join } from 'path';
import chalk from 'chalk'

const findDuplicates = (entries, keyGetter) => {
	const list = [];
	const dups = [];

	entries.forEach(entry => {
		const key = keyGetter(entry);
		if (list.includes(key)) {
			dups.push(entry);
		} else {
			list.push(key);
		}
	});

	return dups;
}

export const assertUniqueInputKeys = (inputs) => {

	const dups = findDuplicates(inputs, (input) => input.inputKey);

	if (dups.length > 0) {
		console.log(chalk.bold.yellow('*** Duplicate image inputs where found. ***'));

		dups.forEach(input => {
			const fileName = join(input.file.local, input.file.base);

			console.log(
				chalk.dim(input.inputKey),
				chalk.dim('-'),
				chalk.magenta(fileName),
			);
		});

		console.log('');
	}
}

export const assertUniqueOutputKeys = (outputs) => {

	const dups = findDuplicates(outputs, (output) => `${output.inputKey} ${output.outputKey} ${output.file.path}`);

	if (dups.length > 0) {
		throw new ValidationError(`Duplicate image outputs where found. (Make sure to use the "clone" method for each image)`)
	}
}


import { spawn as spawnChild } from 'child_process'
import { RuntimeError } from './error/runtime.js';
import { bundle } from './bundle.js';

export const spawn = async (input, options = {}) => {
	const { code } = await bundle(input, { ...options, sourceMap: false });

	let node;

	if (options.env && options.env.length > 0) {
		node = spawnChild('env', [...options.env, 'node']);
	} else {
		node = spawnChild('node');
	}

	node.stdin.write(code);
	node.stdin.end();

	return node;
}

export const exec = async (input, options = {}) => {
	const node = await spawn(input, options);
	return new Promise((resolve, reject) => {
		const outs = [];
		const errs = [];

		node.stderr.on('data', (data) => {
			errs.push(data);
		});

		node.stdout.on('data', (data) => {
			outs.push(data);
		});

		node.on('error', reject);
		node.on('exit', () => {
			if (errs.length) {
				const error = Buffer
					.concat(errs)
					.toString('utf8')
					.replace(/\n$/, '');

				return reject(new RuntimeError(error));
			}

			const result = Buffer
				.concat(outs)
				.toString('utf8')
				.replace(/\n$/, '');

			resolve(result);
		});
	});
}

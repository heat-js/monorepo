
import { bundle, compile, exec, RuntimeError } from "../src";
import { join } from 'path';

describe('Bundle', () => {

	const testPath = (test) => {
		return join(process.cwd(), 'test/data', test, 'index.js');
	}

	it('should support every file type', async () => {
		const path = testPath('every-file-type');
		const result = await bundle(path);
		const types = ['JS', 'JSX', 'COFFEE', 'TS', 'JSON', 'HTML', 'MD', 'LUA', 'hash'];

		types.forEach((type) => {
			expect(result.code.includes(`${type} =`)).toBe(true);
		});
	});

	it('should remove un-used code (treeshaking)', async () => {
		const path = testPath('treeshaking');
		const result = await bundle(path, { sourceMap: false });
		expect(result.code).toBe("'use strict';\n\n");
	});

	it('should exec', async () => {
		const path = testPath('console-log');
		const result = await exec(path);
		expect(result).toBe('Hello World');
	});

	it('should compile a single file', async () => {
		const path = testPath('compile-single-file');
		const result = await compile(path, { sourceMap: false });
		expect(result.code).toBe(`'use strict';\n\nvar other = require('./other');\n\nother.log('First');\n`);
	});

	it('should fail for syntax errors', async () => {
		const path = testPath('syntax-error');
		await expect(exec(path))
			.rejects.toThrow(Error);
	});

	it('should fail for runtime errors', async () => {
		const path = testPath('runtime-error');

		await expect(exec(path))
			.rejects.toThrow(RuntimeError);

		await expect(exec(path))
			.rejects.toThrow('Random Error');
	});

});

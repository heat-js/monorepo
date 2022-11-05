
import { bundle, compile, exec, RuntimeError } from "../src";
import { join } from 'path';

describe('Bundle', () => {

	const testPath = (test) => {
		return join(process.cwd(), 'test/data', test, 'index.js');
	}

	it('should support every file type', async () => {
		const result = await bundle(testPath('every-file-type'));
		const types = ['JS', 'JSX', 'COFFEE', 'TS', 'JSON', 'HTML', 'MD', 'LUA', 'hash'];
		types.forEach((type) => {
			expect(result.code.includes(`${type} =`)).toBe(true);
		});
	});

	it('should remove un-used code (treeshaking)', async () => {
		const result = await bundle(testPath('treeshaking'), { sourceMap: false });
		expect(result.code).toBe("'use strict';\n\n");
	});

	it('should exec', async () => {
		const result = await exec(testPath('console-log'));
		expect(result).toBe('Hello World');
	});

	it('should compile a single file', async () => {
		const result = await compile(testPath('compile-single-file'), { sourceMap: false });
		expect(result.code).toBe(`'use strict';\n\nvar other = require('./other');\n\nother.log('First');\n`);
	});

	it('should fail for syntax errors', async () => {
		await expect(exec(testPath('syntax-error')))
			.rejects.toThrow(Error);
	});

	it('should fail for runtime errors', async () => {
		await expect(exec(testPath('runtime-error')))
			.rejects.toThrow(RuntimeError);

		await expect(exec(testPath('runtime-error')))
			.rejects.toThrow('Random Error');
	});

});

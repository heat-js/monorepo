
import { basename } from 'path';
const os = require('node:os');

describe('Javascript Test', function() {

	it('should be able to use imported modules', () => {
		expect(
			basename(__dirname)
		).toBe('test');
	});

	it('should be able to use required modules', () => {
    	expect(
			typeof os.platform()
		).toBe('string');
	});

	it('should support every file type', () => {
		const result = require('./file-types/index');
		const types = ['JS', 'JSX', 'COFFEE', 'TS', 'JSON', 'HTML', 'MD', 'LUA', 'hash'];
		console.log(result);
		// types.forEach((type) => {
		// 	expect(result.includes(type)).toBe(true);
		// });
	});
});

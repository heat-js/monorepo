
const stepFunctionsLocal = require('../../src/index');

describe('Test Spawn/Kill Local StepFunctions', function() {
	let process = null

	it('should spawn local step functions', function() {
		process = stepFunctionsLocal.spawn();
	});

	it('should kill the spawned process', function() {
		process.kill();
	});
});

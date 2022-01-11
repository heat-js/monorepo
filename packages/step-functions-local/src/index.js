
const { spawn } = require('child_process');
const path 		= require('path');

module.exports.spawn = function({
	accountId = '123456789012',
	region = 'us-east-1',
	lambdaEndpoint = null,
	sqsEndpoint = null,
	snsEndpoint = null,
	waitTimeScale = 0 } = {}
) {
	const libPath = path.join(
		__dirname,
		'../lib/2019-06-05/'
	);

	const jarPath = path.join(
		libPath,
		'StepFunctionsLocal.jar'
	);

	const args = [
		`-Djava.library.path=${libPath}`,
		'-jar',
		jarPath
	]

	if (accountId !== null) {
		args.push('-account', accountId.toString());
	}

	if (region !== null) {
		args.push('-region', region.toString());
	}

	if (lambdaEndpoint !== null) {
		args.push('-lambdaEndpoint', lambdaEndpoint.toString());
	}

	if (sqsEndpoint !== null) {
		args.push('-sqsEndpoint', sqsEndpoint.toString());
	}

	if (snsEndpoint !== null) {
		args.push('-snsEndpoint', snsEndpoint.toString());
	}

	if (waitTimeScale !== null) {
		args.push('-waitTimeScale', waitTimeScale.toString());
	}

	return spawn('java', args, {
		cwd: 	__dirname,
		shell: 	true
	});
}

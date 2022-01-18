#!/usr/bin/env node

const { execSync } = require('child_process');

try {
	execSync(
		'cd .build; npm publish --non-interactive --access=public',
		{ stdio: 'inherit' }
	);
} catch(error) {}

#!/usr/bin/env node

const coffee 	= require('coffeescript');
const path 		= require('path');
const fs   		= require('fs');
const paths   	= require('./paths.js');

function compile(dir) {
	const stat = fs.lstatSync(dir);
	if(stat.isDirectory()) {

		const newFolder = path.join(paths.build, dir.replace(paths.src, ''));

		try {
			fs.mkdirSync(newFolder);
		} catch (error) { }

		const files = fs.readdirSync(dir);
		files.forEach((file) => {
			compile(path.join(dir, file));
		});
	}
	else {
		if(!dir.endsWith('.coffee')) {
			const file = fs.readFileSync(dir);
			const newFile = path.join(paths.build, dir
				.replace(paths.src, '')
			);
			fs.writeFileSync(newFile, file);
			return;
		}

		const file 	= fs.readFileSync(dir);
		const plain = file.toString('utf8');
		const js	= coffee.compile(plain, {
			transpile: {
				plugins: ['transform-es2015-modules-commonjs']
			}
		});

		const newFile = path.join(paths.build, dir
			.replace(paths.src, '')
			.replace('.coffee', '.js')
		);

		fs.writeFileSync(newFile, js);
	}
}

compile(paths.src);

const copyFiles = [
	'package.json',
	'.npmignore',
];

for(var index in copyFiles) {
	const file 		= copyFiles[index];
	const oldPath 	= path.join(paths.root, 	file);
	const newPath 	= path.join(paths.build, 	file);

	if( fs.existsSync(oldPath) ) {
		fs.copyFileSync(oldPath, newPath);
	}
}

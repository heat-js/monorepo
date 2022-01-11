`#!/usr/bin/env node
`

import { Command } 	from 'commander'
import chalk		from 'chalk'
import Deploy		from './command/deploy'
import Delete		from './command/delete'
import Sync			from './command/sync'
import packageData	from './package.json'

program = new Command
program.version packageData.version
program.name 'awsless'
program.usage chalk"{blue [command]} {green [options]}"

program
	.command 'deploy'
	.description chalk.cyan 'deploy the stack to AWS'
	.option '-c, --capabilities',	'output the stack capabilities that are required'
	.option '-p, --preview',		'preview the stack template'
	.option '-s, --skip-prompt',	'skip confirmation prompt'
	.option '-m, --mute',			'mute sound effects'
	.option '-t, --test',			'run tests before deploying'
	.option '-d, --debug',			'show the full error stack trace'
	.allowUnknownOption()
	# .allowExcessArguments()
	.action Deploy

program
	.command 'delete'
	.description chalk.cyan 'delete the stack from AWS'
	.option '-s, --skip-prompt',	'skip confirmation prompt'
	.option '-m, --mute',			'mute sound effects'
	.option '-d, --debug',			'show the full error stack trace'
	.allowUnknownOption()
	# .allowExcessArguments()
	.action Delete

program
	.command 'sync'
	.description chalk.cyan 'sync to AWS S3'
	.option '-s, --skip-prompt',	'skip confirmation prompt'
	.option '-m, --mute',			'mute sound effects'
	.option '-d, --debug',			'show the full error stack trace'
	.allowUnknownOption()
	# .allowExcessArguments()
	.action Sync

program.parse process.argv

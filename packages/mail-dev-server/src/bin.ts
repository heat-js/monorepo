import { InvalidOptionArgumentError, Command } from 'commander'
import { start } from './index.js'

const program = new Command()

program.name('mail-dev-server')

const handleInt = (value: string) => {
	const parsedValue = parseInt(value, 10)
	if (isNaN(parsedValue)) {
		throw new InvalidOptionArgumentError('Not a number.')
	}
	return parsedValue
}

const handleArgs = (value: string) => {
	const args: Record<string, string> = {}
	console.log(value)

	for (const item of value.split(',')) {
		const [key, value] = item.split('=')
		if (!key || !value)
			throw new InvalidOptionArgumentError('No valid argument is provided, use key=value')
		args[key] = value
	}

	return args
}

program
	.command('start')
	.argument('<path>', 'path where jsx files are located')
	.description('start web server')
	.option('-p, --port <number>', 'port number', handleInt, 8080)
	.option('-a, --args [args...]', 'specify arguments', handleArgs)
	.action(async (path, options) => {
		await start({
			path,
			...options,
		})
	})

program.parse(process.argv)

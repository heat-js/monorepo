
import chalk from 'chalk';
import { logTable } from '../src/helper/terminal';

describe('terminal', () => {
	it('should show colors', async () => {
		const text = 'Param: Value';
		console.log(chalk.cyan(text));
		console.log(chalk.blue(text));
		console.log(chalk.yellow(text));
		console.log(chalk.green(text));
		console.log(chalk.magenta(text));
		console.log(chalk.gray(text));
		console.log(chalk.black(text));
		console.log(chalk.dim(text));
	});

	it('should log error', async () => {
		console.log(
			chalk.yellow('./file.js'),
			chalk.dim('-'),
			chalk.red('Random error')
		);
	});

	it('should log table', async () => {
		logTable({
			test: 'Value',
			'Hello World': 'bar'
		})
	});
});


import symbols from 'log-symbols'
import spinners from 'cli-spinners'
import Draftlog from 'draftlog'
import chalk from 'chalk'

let TerminalLine;

if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) {
	TerminalLine = class {
		update(text) {
			// console.log(text);
		}
	}
}
else {

	Draftlog.into(console).addLineListener(process.stdin);

	TerminalLine = class {
		constructor() {
			this.draft = console.draft()
		}

		update(text) {
			this.draft(text);
		}
	}
}

const loader = spinners.dots;

export class Task extends TerminalLine {

	index = 0;
	finished = false;

	start() {
		if (!this.interval) {
			this.interval = setInterval(() => {
				this.updateFormattedText();
			}, loader.interval);
		}
	}

	done() {
		clearInterval(this.interval);

		this.finished = true;
		this.interval = null;
		this.updateFormattedText();
	}

	setPrefix(prefix) {
		this.prefix = prefix;
	}

	setName(name) {
		this.name = name;
	}

	updateFormattedText() {
		const text = [];

		if (this.prefix) {
			text.push(this.prefix);
		}

		if (this.finished) {
			text.push(chalk.green(`${symbols.success} Done`));
		}
		else {
			const frame = loader.frames[this.index++ % loader.frames.length];

			text.push(chalk.blue(frame));
			text.push(chalk.yellow(this.name));
		}

		this.update(text.join(' '));

	}
}


export const logTable = (data) => {
	const length = Object.keys(data).reduce((length, text) => {
		return Math.max(length, text.length);
	}, 0) + 2;

	const lines = Object.entries(data).map(([key, value]) => {
		return (key + ':').padEnd(length, ' ') + chalk.bold.blue(value);
	});

	console.log('\n' + lines.join('\n'))
}

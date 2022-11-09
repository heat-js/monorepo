
const prefix = '[viewable] ';

export class ViewableError extends Error {
	constructor(message:string) {
		let m = message;

		if(0 !== m.indexOf(prefix)) {
			m = prefix + m;
		}

		super(m);
	}
}


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

export const isViewableError = (error:Error):boolean => {
	return error instanceof ViewableError || 0 === error.message.indexOf(prefix);
}

export const getViewableErrorMessage = (error:ViewableError):string => {
	if(0 === error.message.indexOf(prefix)) {
		return error.message.substring(prefix.length);
	}

	return error.message;
}


import { App } from "./app"
import { compose, Handler } from "./compose";

// interface LambdaApp extends App {
// 	input?: any;
// 	output?: any;
// 	context?: object
// }

interface ICallback {
	(app: App, ...args): void
}

export interface IHandle {
	(input?:any, context?:object, callback?:(error:Error|null|undefined, response:any) => void): void;

	app?: App;
	emit: (event:string, args: any) => void;
	on: (event:string, callback:ICallback) => void;
	// off: (event:string, callback:(...args) => void) => void;
}

export const handle = (...handlers:Handler[]) => {
	const fn = compose(handlers);
	const listeners:{ event:string, callback:ICallback }[] = [];

	const handle:IHandle = async (input, context = {}, callback) => {
		const app = new App(input, context, handle);

		try {
			await fn(app);
		}
		catch (error) {
			if(callback) {
				// Lambda supports errors with extra data.
				callback(error, error.getData && error.getData());
				return;
			}

			throw error;
		}

		const output = app.output;

		if(callback) {
			callback(null, output);
			return;
		}

		return output;
	}

	handle.emit = (event, app, ...args) => {
		listeners.forEach((listener) => {
			if(listener.event === event) {
				listener.callback(app, ...args);
			}
		})
	};

	handle.on = (event, callback) => {
		listeners.push({ event, callback });
	};

	return handle;
}

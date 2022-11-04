

import { App } from './app'

export type Next = () => void;
export type Handler = (app:App, next:Next) => void;

export const compose = (handlers:Handler[] = []) => {
	const stack = handlers.flat() as Handler[];

	for (const handler of stack) {
		if ((typeof handler as any) !== "function") {
			throw new TypeError("Handlers must be a function");
		}
	}

	return (app: App) => {
		let index = -1;
		const dispatch = (pos) => {
			const next = () => {
				if(pos <= index) {
					return Promise.reject(new Error('next() called multiple times'));
				}

				dispatch(pos + 1);
			}

			const handler = stack[pos];

			if(pos === stack.length) {
				return Promise.resolve();
			}

			try {
				return Promise.resolve(handler(app, next));
			}
			catch(error) {
				return Promise.reject(error);
			}
		}

		return dispatch(0)
	}
}

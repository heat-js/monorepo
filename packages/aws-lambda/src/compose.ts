

import { IApp } from './app'

export type Next = () => void;
export type Handler = (app:IApp, next:Next) => void;

export const compose = (handlers:Handler[] = []) => {
	const stack = handlers.flat() as Handler[];

	for (const handler of stack) {
		if ((typeof handler as any) !== "function") {
			throw new TypeError("Handlers must be a function");
		}
	}

	return (app: IApp) => {
		let index = -1;
		const dispatch = (pos) => {
			if(pos === stack.length) {
				return
			}

			const next = () => {
				if(pos <= index) {
					throw new Error('next() called multiple times');
				}

				return dispatch(pos + 1);
			}

			return stack[pos](app, next);
		}

		return Promise.resolve(dispatch(0))
	}
}

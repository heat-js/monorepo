
import { IApp } from './app'

export type Next = () => void
export type Handler = (app:IApp, next:Next) => void
export type Handlers = Array<Handlers | Handler>

export const compose = (handlers:Handlers = []) => {
	const stack = handlers.flat(10) as Handler[]

	for (const handler of stack) {
		if ((typeof handler as any) !== 'function') {
			throw new TypeError('Handler must be a function')
		}
	}

	return (app: IApp) => {
		let index = -1
		const dispatch = (pos) => {
			if(pos === stack.length) {
				return
			}

			const next = () => {
				if(pos <= index) {
					throw new Error('next() called multiple times')
				}

				return dispatch(pos + 1)
			}

			return stack[pos](app, next)
		}

		return Promise.resolve(dispatch(0))
	}
}

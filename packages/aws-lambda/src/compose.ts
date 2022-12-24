import { Handler, Handlers, Next, OptStruct, Output, Request, Response } from './types.js'

export const compose = <I extends OptStruct, O extends OptStruct>(handlers: Handlers<I, O> = []) => {
	const stack = [handlers].flat(10) as Handler<I, O>[]

	for (const handler of stack) {
		if ((typeof handler as any) !== 'function') {
			throw new TypeError('Handler must be a function')
		}
	}

	return (request: Request<I>): Promise<Output<O>> => {
		let index = -1
		const dispatch = (pos: number): Response<O> => {
			if (pos === stack.length) {
				return undefined as Response<O>
			}

			const next: Next<O> = (): Response<O> => {
				if (pos <= index) {
					throw new Error('next() called multiple times')
				}

				return dispatch(pos + 1)
			}

			return stack[pos](request, next)
		}

		return Promise.resolve(dispatch(0))
	}
}

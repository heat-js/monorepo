import { Context, Handler, Handlers, Input, Next, OptStruct, Output, Response } from '../src/types.js'

export const compose = <I extends OptStruct, O extends OptStruct>(handlers: Handlers<I, O> = []) => {
	const stack = [handlers].flat(10) as Handler<I, O>[]

	for (const handler of stack) {
		if ((typeof handler as any) !== 'function') {
			throw new TypeError('Handler must be a function')
		}
	}

	return (event: Input<I>, context: Context): Promise<Output<O>> => {
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

			return stack[pos](event, context, next)
		}

		return Promise.resolve(dispatch(0))
	}
}

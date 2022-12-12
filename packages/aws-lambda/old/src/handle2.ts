import { object, string, Struct, Infer, create } from 'superstruct'
// import { bugsnag } from './handlers/bugsnag'
// import { warmer } from './handlers/warmer'

interface IHandle<I extends Struct, O extends Struct, F> {
	input?: I
	output?: O
	middlewares?: any[]
	factories?: F
	handle: (input: Infer<I>, context:object, services:F) => Promise<Infer<O>> | Infer<O>
}

interface ILambda<I extends Struct, O extends Struct> {
	(event:Infer<I>, context?:object): Promise<Infer<O>>
}

export const handle = <I extends Struct, O extends Struct, F>({ input, output, factories, handle }:IHandle<I, O, F>) => {
	const lambda:ILambda<I, O> = async (event, context = {}) => {
		const i = create(event, input)
		const o = await handle(i, context, factories)
		return create(o, output)
	}

	return lambda
}

interface IInvoke<T extends ILambda<Struct, Struct>> {
	service?: string
	name: string
	payload: Parameters<T>[0]
}

export const invoke = <T extends ILambda<Struct, Struct>>({ service, name, payload }:IInvoke<T>):ReturnType<T> => {
	return
}

export const inject = (factory) => {
	return (target, property: string, descriptor) => {

	}
}

const factory = () => {
	return (target, property: string, descriptor: PropertyDescriptor) => {
		const handle = descriptor.value
		descriptor.value = (event, context) => {
			return handle(event, {
				...context,
				lambda: 1
			})
		}
	}
}

class Lambda {
	static input = object({ one: string() })
	static output = object({ two: string() })

	@factory()
	handle({ one }, context) {
		return {
			two: one
		}
	}
}

const lambda = handle({
	input: object({ one: string() }),
	output: object({ two: string() }),
	handle({ one }, context) {
		return {
			two: one
		}
	}
})

// const lambda = handle({
// 	input: object({ one: string() }),
// 	output: object({ two: string() }),
// 	// factories: {
// 	// 	...factory()
// 	// },
// 	// middlewares: [
// 	// 	bugsnag(),
// 	// 	warmer()
// 	// ],

// 	@inject(lambda())
// 	handle({ one }, context, services) {
// 		// context
// 		// services.lambda
// 		// if(middlewares.context) {

// 		// }
// 		return {
// 			two: one
// 		}
// 	}
// });

;(async () => {
	const result1 = await lambda({ one: 'hi' })
	const result2 = await invoke<typeof lambda>({
		name: 'lambda__name',
		payload: {
			one: 'hi'
		}
	})
})()

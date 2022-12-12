import { object, string, Struct, Infer, create } from 'superstruct'
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'

export type Context = { [ key: string ]: any }
export type Output<O extends Struct> = Infer<O> | Promise<Infer<O>>
export type Next<O extends Struct> = () => Output<O>
export type Handler<I extends Struct, O extends Struct> = (event:Infer<I>, context: Context, next: Next<O>) => Output<O>
export type Handlers<I extends Struct, O extends Struct> = Array<Handlers<I, O> | Handler<I, O>>

export const compose = <I extends Struct, O extends Struct>(handlers: Handlers<I, O> = []) => {
	const stack = handlers.flat(10) as Handler<I, O>[]

	for (const handler of stack) {
		if ((typeof handler as any) !== 'function') {
			throw new TypeError('Handler must be a function')
		}
	}

	return (event: Infer<I>, context: object): Promise<Infer<O>> => {
		let index = -1
		const dispatch = (pos) => {
			if (pos === stack.length) {
				return
			}

			const next = () => {
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

interface Options<I extends Struct, O extends Struct> {
	input?: I
	output?: O
	handlers: Handlers<I, O>
}

interface LambdaFunction<I extends Struct, O extends Struct> {
	(event:Infer<I>, context?:object): Promise<Infer<O>>
	// use: (...handlers: Handlers<I, O>) => LambdaFunction<I, O>
}

export const handle = <I extends Struct, O extends Struct>({ input, output }:Options<I, O>): LambdaFunction<I, O> => {
	const stack = []
	const handle = compose(stack)
	const lambda = async (event, context = {}) => {
		const i = create(event, input)
		const o = await handle(i, context)
		return create(o, output)
	}

	// lambda.use = (...handlers) => {
	// 	stack.push(handlers)
	// 	return lambda
	// }

	return lambda
}

interface Invoke<T extends LambdaFunction<Struct, Struct>> {
	service?: string
	name: string
	payload: Parameters<T>[0]
}

export const invoke = <T extends LambdaFunction<Struct, Struct>>({ service, name, payload }:Invoke<T>):ReturnType<T> => {
	return
}


export const event = (eventName: string) => {
	return (_:any, context, next:Next<any>) => {
		context.emit(eventName, context)
		return next()
	}
}

export const sns = () => {
	return (_:any, context, next:Next<any>) => {
		context.sns = new SNSClient({ apiVersion: '2016-11-23' })
		return next()
	}
}

interface Publish {
	region?: string
	accountId?: string
	service?: string
	topic: string
	subject?: string
	payload?: any
	attributes?: { [key: string]: string }
}

const publish = (client: SNSClient, { service, topic, subject, payload, region, accountId, attributes = {} }: Publish) => {
	const snsTopic = serviceName(service, topic)
	const command = new PublishCommand({
		TopicArn: `arn:aws:sns:${this.region}:${this.accountId}:${snsTopic}`,
		Subject: subject,
		Message: JSON.stringify(payload),
		MessageAttributes: this.formatMessageAttributes({
			topic: snsTopic,
			...attributes
		})
	})

	return client.send(command)
}

const lambda = handle({
	input: object({ one: string() }),
	output: object({ two: string() }),
	handlers: [
		sns(),
		event('before'),
		(event, context, next) => {
			publish(context.sns, {
				service: 'hello',
				topic: 'yep',
				payload: event
			})

			return next()
		},
		() => {
			return {
				two: 'string'
			}
		}
	]
})

;(async () => {
	const result1 = await lambda({ one: 'hi' })
	const result2 = await invoke<typeof lambda>({
		name: 'lambda__name',
		payload: {
			one: 'hi'
		}
	})
})()

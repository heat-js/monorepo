import { object, string, Struct, Infer, create } from 'superstruct'
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'
import { Context } from 'aws-lambda'

export type Request<I extends Struct> = {
	event: any
	input: Infer<I>
	context?: Context
	emit: (event:string, ...args) => void
	[ key: string ]: any
}

export type Response<O extends Struct> = Infer<O> | Promise<Infer<O>>
export type Next<O extends Struct> = () => Response<O>
export type Handler<I extends Struct, O extends Struct> = (request:Request<I>, next: Next<O>) => Response<O>
export type Handlers<I extends Struct, O extends Struct> = Array<Handlers<I, O> | Handler<I, O>>
export type EventCallback<I extends Struct> = (request: Request<I>, ...args) => void
export type EventListener<I extends Struct> = { event: string, callback: EventCallback<I> }

export const compose = <I extends Struct, O extends Struct>(handlers: Handlers<I, O> = []) => {
	const stack = handlers.flat(10) as Handler<I, O>[]

	for (const handler of stack) {
		if ((typeof handler as any) !== 'function') {
			throw new TypeError('Handler must be a function')
		}
	}

	return (request: Request<I>): Promise<Infer<O>> => {
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

			return stack[pos](request, next)
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
	on: (event:string, callback: EventCallback<I>) => void
}

export const handle = <I extends Struct, O extends Struct>({ input, output, handlers }:Options<I, O>): LambdaFunction<I, O> => {
	const handle = compose([ handlers ])
	const listeners:EventListener<I>[] = []

	const lambda = async (event, context) => {
		const request:Request<I> = {
			event: event,
			input: input ? create(event, input) : event,
			context,
			emit: (event, ...args) => {
				listeners.forEach((listener) => {
					if(listener.event === event) {
						listener.callback(request, ...args)
					}
				})
			}
		}

		const response:Response<O> = await handle(request)
		return output ? create(response, output) : response
	}

	lambda.on = (event, callback) => {
		listeners.push({ event, callback })
	}

	return lambda
}

interface Invoke<T extends LambdaFunction<Struct, Struct>> {
	service?: string
	name: string
	payload: Parameters<T>[0]
}

export const invoke = <T extends LambdaFunction<Struct, Struct>>(lambda, { service, name, payload }:Invoke<T>):ReturnType<T> => {
	return
}

export const event = (eventName: string) => {
	return (request:Request<any>, next:Next<any>) => {
		request.emit(eventName, request)
		return next()
	}
}

export const sns = () => {
	return (request:Request<any>, next:Next<any>) => {
		request.sns = new SNSClient({ apiVersion: '2016-11-23' })
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
		({ input, sns, lambda }, next) => {
			publish(sns, {
				service: 'hello',
				topic: 'yep',
				payload: input
			})

			invoke(lambda, {
				service: '',
				name: 'lol',
				payload: input
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

lambda.on('lol', (request) => {
	request.lambda = {}
})

;(async () => {
	const result1 = await lambda({ one: 'hi' })
	const result2 = await invoke<typeof lambda>({}, {
		name: 'lambda__name',
		payload: {
			one: 'hi'
		}
	})
})()

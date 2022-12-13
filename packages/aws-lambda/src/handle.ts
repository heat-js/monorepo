
import { Context } from 'aws-lambda'
import { create, mask } from 'superstruct'
import { compose } from './compose.js'
import { Container, container } from './di.js'
import { EventCallback, EventListener, Handlers, Input, OptStruct, Output, Request } from './types.js'

interface Options<I extends OptStruct = undefined, O extends OptStruct = undefined> {
	input?: I
	output?: O
	handlers: Handlers<I, O>
}

export type LambdaFunction<I extends OptStruct = undefined, O extends OptStruct = undefined> = (I extends undefined ? {
	(event?:unknown, context?:Context): Promise<Output<O>>
}: {
	(event:Input<I>, context?:Context): Promise<Output<O>>
}) & {
	on: (event:string, callback: EventCallback<I>) => void
	request?: Container & Request<I>
}

export const handle = <I extends OptStruct = undefined, O extends OptStruct = undefined>({ input, output, handlers }:Options<I, O>): LambdaFunction<I, O> => {
	const handle = compose<I, O>(handlers)
	const listeners:EventListener<I>[] = []

	const lambda = async (event: Input<I>, context?:Context):Promise<Output<O>> => {
		const request:Request<I> = container({
			input: input ? mask(event, input) : event,
			event,
			context,
			emit: (event: string, ...args) => {
				listeners.forEach((listener) => {
					if(listener.event === event) {
						listener.callback(request, ...args)
					}
				})
			}
		})

		Object.assign(lambda, { request })

		const response:Output<O> = await handle(request)
		return output ? create(response, output) : response
	}

	lambda.on = (event:string, callback:EventCallback<I>) => {
		listeners.push({ event, callback })
	}

	// @ts-ignore
	return lambda as LambdaFunction<I, O>
}


import { Context } from 'aws-lambda'
import { compose } from './compose.js'
import { transformValidationErrors } from './errors/validation.js'
import { create, mask } from '@heat/validate'
import { Handlers, Input, Logger, Loggers, OptStruct, Output, Request } from './types.js'
import { createTimeout } from './errors/timeout.js'
import { isViewableError } from './errors/viewable.js'

interface Options<I extends OptStruct = undefined, O extends OptStruct = undefined> {
	/** A validation struct to validate the input. */
	input?: I

	/** A validation struct to validate the output. */
	output?: O

	/** Array of middleware functions */
	// before: Befores<I, O>

	/** Array of middleware functions */
	handle: Handlers<I, O>

	/** Array of logging functions that are called when an error is thrown */
	logger?: Loggers

	/** Boolean to specify if viewable errors should be logged */
	logViewableErrors?: boolean
}

/** Invoke the lambda function */
// export type LambdaFunction<I extends OptStruct = undefined, O extends OptStruct = undefined> = (I extends undefined ? {
// (event?:unknown, context?:Context): Promise<Output<O>>
// }: {
// (event:Input<I>, context?:Context): Promise<Output<O>>
// })

export type LambdaFactory = {
	(options:Options<undefined, undefined>): (event?:unknown, context?:Context) => Promise<unknown>
	<I extends OptStruct>(options:Options<I, undefined>): (event:Input<I>, context?:Context) => Promise<unknown>
	<O extends OptStruct>(options:Options<undefined, O>): (event?:unknown, context?:Context) => Promise<Output<O>>
	<I extends OptStruct, O extends OptStruct>(options:Options<I, O>): (event:Input<I>, context?:Context) => Promise<Output<O>>
}

export type LambdaFunction<I extends OptStruct = undefined, O extends OptStruct = undefined> = (
	event: Input<I>,
	context?:Context
) => Promise<Output<O>>

/** Create a lambda handle function. */
export const lambda:LambdaFactory = <I extends OptStruct = undefined, O extends OptStruct = undefined>({ input, output, handle, logger, logViewableErrors = false }:Options<I, O>): LambdaFunction<I, O> => {
	const callback = compose<I, O>(handle)

	const lambda = async (event: Input<I>, context?:Context):Promise<Output<O>> => {

		const log = async (error:unknown) => {
			const list = [ logger ].flat(10) as Logger[]
			await Promise.all(list.map(logger => {
				return logger && logger(error, {
					input: event
				})
			}))
		}

		try {
			const timeout = createTimeout(context, log)
			const request:Request<I> = {
				// input: validate(mask, event, input),
				input: await transformValidationErrors(() => input ? mask(event, input) : event),
				event,
				context,
				log
			}

			Object.assign(lambda, { request })

			const response:Output<O> = await transformValidationErrors(() => callback(request))

			clearTimeout(timeout)

			return output ? create(response, output) : response

		} catch(error) {
			if(!isViewableError(error) || logViewableErrors) {
				await log(error)
			}

			throw error
		}
	}

	return lambda
}

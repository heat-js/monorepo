
import { Context } from 'aws-lambda'
import { randomUUID } from 'crypto'
import { invoke } from './services/lambda.js'

const warmerKey = 'warmer'
const invocationKey = '__WARMER_INVOCATION_ID__'
const correlationKey = '__WARMER_CORRELATION_ID__'
const concurrencyKey = 'concurrency'

type Input = {
	invocation: number
	concurrency: number
	correlation: string
}

export const getWarmUpEvent = (event: any): Input | undefined => {
	if (typeof event === 'object' && event[warmerKey] === true) {
		return {
			invocation: parseInt(event[invocationKey], 10) || 0,
			concurrency: parseInt(event[concurrencyKey], 10) || 3,
			correlation: event[correlationKey],
		}
	}
}

export const warmUp = async (input: Input, context?:Context) => {
	const event = {
		action: warmerKey,
		functionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
		functionVersion: process.env.AWS_LAMBDA_FUNCTION_VERSION,
	}

	if(input.correlation) {
		console.log({
			...event,
			...input
		})
	} else {
		const correlation = context?.awsRequestId || randomUUID()

		console.log({
			...event,
			correlation,
			invocation: 1
		})

		await Promise.all(Array.from({ length: input.concurrency - 1 }).map((_, index) => {
			return invoke({
				name: process.env.AWS_LAMBDA_FUNCTION_NAME || '',
				payload: {
					[warmerKey]: true,
					[invocationKey]: index + 2,
					[correlationKey]: correlation,
					[concurrencyKey]: input.concurrency
				}
			})
		}))
	}
}

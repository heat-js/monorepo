
import { randomUUID } from 'crypto'
import { invoke } from '../services/lambda.js'
import { Next, Request } from '../types.js'

const warmerKey = 'warmer'
const invocationKey = '__WARMER_INVOCATION_ID__'
const correlationKey = '__WARMER_CORRELATION_ID__'

interface Config {
	log?: boolean
	concurrency?: number
}

type Input = {
	invocation: number
	correlation: string
}

const getWarmerInput = (request: Request): Input | undefined => {
	const input = request.input as any
	if (typeof input === 'object' && input[warmerKey] === true) {
		return {
			invocation: input[invocationKey] || 0,
			correlation: input[correlationKey]
		}
	}
}

export const warmer = ({ log = true, concurrency = 1 }:Config = {}) => {
	const notify = (message: object) => {
		if(log) {
			console.log(message)
		}
	}

	return async (request: Request<any | undefined>, next:Next<any>): Promise<any> => {
		const input = getWarmerInput(request)

		if(!input) {
			return next()
		}

		const event = {
			action: warmerKey,
			functionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
			functionVersion: process.env.AWS_LAMBDA_FUNCTION_VERSION,
		}

		if(input.correlation) {
			notify({
				...event,
				...input
			})
		} else {
			const correlation = request.context?.awsRequestId || randomUUID()

			notify({
				...event,
				correlation,
				invocation: 1
			})

			await Promise.all(Array.from({ length: concurrency - 1 }).map((_, index) => {
				return invoke({
					name: process.env.AWS_LAMBDA_FUNCTION_NAME || '',
					payload: {
						[warmerKey]: true,
						[invocationKey]: index + 2,
						[correlationKey]: correlation
					}
				})
			}))
		}

		return
	}
}

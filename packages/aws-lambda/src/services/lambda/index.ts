
import { fromUtf8, toUtf8 } from '@aws-sdk/util-utf8-node'
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'
import { isViewableErrorString, parseViewableErrorString, ViewableError } from '../../errors/viewable'
import { serviceName } from '../../helper'
import { LambdaFunction } from '../../handle'
import { Struct } from 'superstruct'

interface InvokeOptions<T extends LambdaFunction<Struct, Struct>> {
	service?: string
	type?: 'RequestResponse' | 'Event' | 'DryRun'
	name: string
	payload?: Parameters<T>[0]
	reflectViewableErrors?: boolean
}

interface LambdaError extends Error {
	name: string
	message: string
	response?: any
	metadata?: { service: string }
}

const isErrorResponse = (response: any): boolean => {
	return typeof response === 'object' && response !== null && response.errorMessage
}

export const invoke = async <T extends LambdaFunction<Struct, Struct>>(client: LambdaClient, { service, name, type = 'RequestResponse', payload, reflectViewableErrors = true }: InvokeOptions<T>):Promise<ReturnType<T>> => {
	const command = new InvokeCommand({
		InvocationType: type,
		FunctionName: serviceName(service, name),
		Payload: fromUtf8(JSON.stringify(payload))
	})

	const result = await client.send(command)

	if(!result.Payload) {
		return undefined as ReturnType<T>
	}

	const json = toUtf8(result.Payload)
	const response = JSON.parse(json)

	if (isErrorResponse(response)) {
		let error: LambdaError

		if (isViewableErrorString(response.errorMessage)) {
			const errorData = parseViewableErrorString(response.errorMessage)
			if (reflectViewableErrors) {
				error = new ViewableError(errorData.type, errorData.message, errorData.data)
			} else {
				error = new Error(errorData.message)
			}
		} else {
			error = new Error(response.errorMessage)
		}

		error.name = response.errorType
		error.response = response
		error.metadata = {
			service: `${service}__${name}`
		}

		throw error
	}

	return response
}

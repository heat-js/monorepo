import { fromUtf8, toUtf8 } from '@aws-sdk/util-utf8-node'
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'
import { isViewableErrorString, parseViewableErrorString, ViewableError } from '../errors/viewable.js'
import { serviceName } from '../helper.js'
import { LambdaFunction } from '../lambda.js'
import { getLambdaClient } from '../clients/lambda.js'
import { OptStruct } from '../types.js'

interface InvokeOptions {
	client?: LambdaClient
	service?: string
	type?: 'RequestResponse' | 'Event' | 'DryRun'
	name: string
	payload?: unknown
	reflectViewableErrors?: boolean
}

interface UnknownInvokeOptions extends InvokeOptions {
	payload?: unknown
}

interface KnownInvokeOptions<Lambda extends LambdaFunction<OptStruct, OptStruct>> extends InvokeOptions {
	payload: Parameters<Lambda>[0]
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

type Invoke = {
	(options: UnknownInvokeOptions): Promise<unknown>
	<Lambda extends LambdaFunction<OptStruct, OptStruct>>(options: KnownInvokeOptions<Lambda>): Promise<ReturnType<Lambda>>
}

/** Invoke lambda */
export const invoke:Invoke = async ({
	client,
	service,
	name,
	type = 'RequestResponse',
	payload,
	reflectViewableErrors = true
}: UnknownInvokeOptions): Promise<unknown> => {
	const command = new InvokeCommand({
		InvocationType: type,
		FunctionName: serviceName(service, name),
		Payload: payload ? fromUtf8(JSON.stringify(payload)) : undefined,
	})

	const result = await (client || await getLambdaClient({})).send(command)

	if (!result.Payload) {
		return undefined
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
			service: `${service}__${name}`,
		}

		throw error
	}

	return response
}


import { fromUtf8, toUtf8 } from '@aws-sdk/util-utf8-node'
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'
import { lambdaClient } from '@heat/aws-clients'
import { isViewableErrorString, parseViewableErrorString, ViewableError } from '../errors/viewable.js'
import { LambdaFunction } from '../lambda.js'
import { OptStruct } from '../types.js'
import { Jsonify, AsyncReturnType } from 'type-fest'

interface InvokeOptions {
	client?: LambdaClient
	type?: 'RequestResponse' | 'Event' | 'DryRun'
	name: string
	qualifier?: string
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
	({ client, name, qualifier, type, payload, reflectViewableErrors }: UnknownInvokeOptions): Promise<unknown>
	<Lambda extends LambdaFunction<OptStruct, OptStruct>>({ client, name, qualifier, type, payload, reflectViewableErrors }: KnownInvokeOptions<Lambda>): Promise<Jsonify<AsyncReturnType<Lambda>>>
}

/** Invoke lambda function */
export const invoke:Invoke = async ({
	client = lambdaClient.get(),
	name,
	qualifier,
	type = 'RequestResponse',
	payload,
	reflectViewableErrors = true
}: UnknownInvokeOptions): Promise<unknown> => {
	const command = new InvokeCommand({
		InvocationType: type,
		FunctionName: name,
		Payload: payload ? fromUtf8(JSON.stringify(payload)) : undefined,
		Qualifier: qualifier,
	})

	const result = await client.send(command)
	if (!result.Payload) {
		return undefined
	}

	const json = toUtf8(result.Payload)
	if (!json) {
		return undefined
	}

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
			service: name
		}

		throw error
	}

	return response
}

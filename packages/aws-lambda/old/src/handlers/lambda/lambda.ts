
import { fromUtf8 } from '@aws-sdk/util-utf8-node'
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'
import { isViewableErrorString, parseViewableErrorString, ViewableError } from '../../errors/viewable'
import { serviceName } from '../../helper'

interface IInvoke {
	service?: string
	type?: 'RequestResponse' | 'Event' | 'DryRun'
	name: string
	payload?: any
	reflectViewableErrors?: boolean
}

interface LambdaError extends Error {
	name: string
	message: string
	response?: any
	metadata?: { service: string }
}

export class Lambda {
	private client

	constructor(client: LambdaClient) {
		this.client = client
	}

	private isErrorResponse(response: any): boolean {
		return typeof response === 'object' && response !== null && response.errorMessage
	}

	async invoke({ service, name, type = 'RequestResponse', payload, reflectViewableErrors = true }: IInvoke) {

		const command = new InvokeCommand({
			FunctionName: serviceName(service, name),
			InvocationType: type,
			Payload: fromUtf8(JSON.stringify(payload))
		})

		const result = await this.client.send(command)
		const response = JSON.parse(result.Payload)

		if (this.isErrorResponse(response)) {
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
}

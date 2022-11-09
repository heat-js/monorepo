
import { LambdaClient, InvokeCommand, InvokeAsyncCommand } from '@aws-sdk/client-lambda'
import { ViewableError } from '../../errors/viewable'
import { serviceName } from '../../helper'

interface IInvoke {
	service?: string
	type?: 'RequestResponse' | 'Event' | 'DryRun'
	name: string
	payload?: object
}

interface IInvokeWithErrors extends IInvoke {
	reflectViewableErrors?: boolean
}

export class Lambda {
	private client;

	constructor(client: LambdaClient) {
		this.client = client;
	}

	private isErrorResponse(response: any): boolean {
		return typeof response === 'object' && response !== null && response.errorMessage;
	}

	private isViewableError(response: any): boolean {
		return (response.errorType === 'ViewableError' || 0 === response.errorMessage.indexOf('[viewable] '));
	}

	async invoke({ service, name, type = 'RequestResponse', payload, reflectViewableErrors = true }: IInvokeWithErrors) {

		const command = new InvokeCommand({
			FunctionName: serviceName(service, name),
			InvocationType: type,
			Payload: Buffer.from(JSON.stringify(payload))
		});

		const result = await this.client.send(command);
		const response = JSON.parse(result.Payload);

		if (this.isErrorResponse(response)) {
			let error;

			if (reflectViewableErrors && this.isViewableError(response)) {
				error = new ViewableError(response.errorMessage)
			}
			else {
				error = new Error(response.errorMessage.replace('[viewable] ', ''));
			}

			error.name = response.errorType;
			error.response = response;
			error.metadata = {
				service: `${service}__${name}`
			};

			throw error;
		}

		return response;
	}

	// async invokeAsync({ service, name, payload }: IInvoke) {
	// 	const command = new InvokeAsyncCommand({
	// 		FunctionName: this.getFunctionName(service, name),
	// 		InvokeArgs: JSON.stringify(payload)
	// 	});

	// 	await this.client.send(command);
	// }
}

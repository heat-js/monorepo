
import { LambdaClient, InvokeCommand, InvokeAsyncCommand } from '@aws-sdk/client-lambda'

interface IInvoke {
	service: string
	name: string
	payload?: object
}

interface IInvokeWithErrors extends IInvoke {
	reflectViewableErrors?: boolean
}

export class Invoker {
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

	async invoke({ service, name, payload, reflectViewableErrors = true }: IInvokeWithErrors) {

		const command = new InvokeCommand({
			FunctionName: `${service}__${name}`,
			Payload: JSON.stringify(payload)
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

	async invokeAsync({ service, name, payload }: IInvoke) {
		const command = new InvokeAsyncCommand({
			FunctionName: `${service}__${name}`,
			InvokeArgs: JSON.stringify(payload)
		});

		await this.client.send(command);
	}
}


import { App } from '../../app'
import { Next } from '../../compose'
import { Invoker } from './invoker'
import { LambdaClient } from '@aws-sdk/client-lambda'

export interface LambdaApp {
	lambda: Invoker
}

export const lambda = () => {
	return async (app: App, next: Next) => {

		const lambdaApp: LambdaApp = {
			lambda: () => {
				const client = new LambdaClient({
					apiVersion: '2015-03-31',
					region: process.env.AWS_REGION || 'eu-west-1'
				})

				return new Invoker(client);
			}
		};

		await next({
			...app,
			...lambdaApp
		})

		// app.extend({
		// 	lambda: () => {
		// 		const client = new LambdaClient({
		// 			apiVersion: '2015-03-31',
		// 			region: process.env.AWS_REGION || 'eu-west-1'
		// 		})

		// 		return new Invoker(client);
		// 	}
		// })

		// const app: LambdaApp = {
		// 	lambda: () => {
		// 		const client = new LambdaClient({
		// 			apiVersion: '2015-03-31',
		// 			region: process.env.AWS_REGION || 'eu-west-1'
		// 		})

		// 		return new Invoker(client);
		// 	}
		// }

		// app.$.lambda = (): Invoker => {
		// 	const client = new LambdaClient({
		// 		apiVersion: '2015-03-31',
		// 		region: process.env.AWS_REGION || 'eu-west-1'
		// 	})

		// 	return new Invoker(client);
		// }

		await next();
	}
}

// interface IInvoke {
// 	service: string
// 	name: string
// 	payload?: string
// 	reflectViewableErrors: boolean
// }

// interface IInvokeWithErrors extends IInvoke{
// 	service: string
// 	name: string
// 	payload?: string
// 	reflectViewableErrors: boolean
// }

// class Invoker {
// 	private client;

// 	constructor(client:Lambda) {
// 		this.client = client;
// 	}

// 	private isErrorResponse(response: any) {
// 		return typeof response === 'object' && response !== null && response.errorMessage;
// 	}

// 	private isViewableError(response: any) {
// 		return ( response.errorType === 'ViewableError' || 0 === response.errorMessage.indexOf('[viewable] ') );
// 	}

// 	async invoke({ service, name, payload, reflectViewableErrors = true }: IInvokeWithErrors) {
// 		const result = await this.client.invoke({
// 			FunctionName: 	`${service}__${name}`,
// 			Payload: 		JSON.stringify(payload)
// 		})
// 		.promise();

// 		const response = JSON.parse(result.Payload);

// 		if(this.isErrorResponse(response)) {
// 			let error;

// 			if(reflectViewableErrors && this.isViewableError(response)) {
// 				error = new ViewableError(response.errorMessage)
// 			}
// 			else {
// 				error = new Error(response.errorMessage.replace('[viewable] ', ''));
// 			}

// 			error.name 		= response.errorType;
// 			error.response 	= response;
// 			error.metadata 	= {
// 				service: `${service}__${name}`
// 			};

// 			throw error;
// 		}

// 		return response;
// 	}

// 	async invokeAsync({ service, name, payload }: IInvoke) {
// 		return await this.client.invokeAsync({
// 			FunctionName: 	`${service}__${name}`,
// 			InvokeArgs: 	JSON.stringify(payload)
// 		})
// 		.promise()
// 	}
// }

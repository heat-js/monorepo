
import { IApp } from '../../app'
import { Next } from '../../compose'
import { Lambda } from './lambda'
export { Lambda } from './lambda'
import { LambdaClient } from '@aws-sdk/client-lambda'

// export interface LambdaApp {
// 	lambda: Lambda
// }

// export const Lambda = Lambda;

export const lambda = () => {
	return async (app: IApp, next: Next) => {

		app.$.lambda = () => {
			const client = new LambdaClient({
				apiVersion: '2015-03-31',
				region: process.env.AWS_REGION || 'eu-west-1'
			});

			return new Lambda(client);
		}

		await next();
	}
}

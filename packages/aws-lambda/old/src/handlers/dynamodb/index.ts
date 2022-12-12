
import { IApp } from '../../app'
import { Next } from '../../compose'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

export const dynamodb = () => {
	return (app: IApp, next: Next) => {

		app.$.dynamodb = () => {
			const client = new DynamoDBClient({
				apiVersion: '2012-08-10'
			})

			return DynamoDBDocumentClient.from(client)
		}

		return next()
	}
}

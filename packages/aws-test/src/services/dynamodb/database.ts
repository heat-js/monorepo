
import { CreateTableCommand, DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'

export const migrate = (client:DynamoDBClient, definitions) => {
	return Promise.all(definitions.map(definition => {
		return client.send(new CreateTableCommand(definition))
	}))
}

export type SeedData = {[key:string]: object[]}

export const seed = (client:DynamoDBClient, data: SeedData) => {
	return Promise.all(Object.entries(data).map(([TableName, items]) => {
		return Promise.all(items.map(item => {
			return client.send(new PutItemCommand({
				TableName,
				Item: {
					...item
				}
			}))
		}))
	}))
}


import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

export class Table {
	constructor(
		readonly db: DynamoDBDocumentClient,
		readonly name:string
	) {}
}

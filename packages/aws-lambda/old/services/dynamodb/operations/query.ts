
import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { addExpression } from '../helper/expression.js'
import { Table } from '../table.js'
import { Expression, Item, Key } from '../types.js'

export interface QueryOptions {
	keyCondition: Expression
	projection?: Expression
	index?: string
	consistentRead?: boolean
	limit?: number
	forward?: boolean
	cursor?: Key
}

export interface QueryResponse<T> {
	count: number
	items: T[]
	cursor?: Key
}

export const query = async <T extends Item>(table:Table, options:QueryOptions): Promise<QueryResponse<T>> => {
	const { forward = true } = options
	const command = new QueryCommand({
		TableName: table.name,
		IndexName: options.index,
		KeyConditionExpression: options.keyCondition.expression,
		ConsistentRead: options.consistentRead,
		ScanIndexForward: forward,
		Limit: options.limit || 10,
		ExclusiveStartKey: options.cursor,
	})

	addExpression(command.input, options.keyCondition)

	if(options.projection) {
		command.input.ProjectionExpression = options.projection.expression
		addExpression(command.input, options.projection)
	}

	const result = await table.db.send(command)

	return {
		count: result.Count || 0,
		items: result.Items as T[],
		cursor: result.LastEvaluatedKey
	}
}

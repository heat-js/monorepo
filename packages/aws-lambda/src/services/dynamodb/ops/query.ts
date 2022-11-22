import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { addExpression } from '../helper/expression'
import { Table } from '../table'
import { Expression, Item, Key } from '../types'

export interface QueryOptions {
	keyCondition: Expression
	projection?: Expression
	index?: string
	consistentRead?: boolean
	limit?: number
	backwards?: boolean
	cursor?: Key
}

interface QueryResponse<T> {
	count: number
	items: T[]
	cursor?: Key
}

export const query = async <T extends Item>(table:Table, options:QueryOptions): Promise<QueryResponse<T>> => {

	const command = new QueryCommand({
		TableName: table.name,
		IndexName: options.index,
		KeyConditionExpression: options.keyCondition.expression,
		ConsistentRead: options.consistentRead,
		ScanIndexForward: !!options.backwards,
		Limit: options.limit,
		ExclusiveStartKey: options.cursor,
	})

	addExpression(command, options.keyCondition)

	if(options.projection) {
		command.input.ProjectionExpression = options.projection.expression
		addExpression(command, options.projection)
	}

	const result = await table.db.send(command)

	return {
		count: result.Count,
		items: result.Items as T[],
		cursor: result.LastEvaluatedKey
	}
}

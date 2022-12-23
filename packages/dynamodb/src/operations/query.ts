
import { QueryCommand, QueryCommandOutput } from '@aws-sdk/lib-dynamodb'
import { addExpression } from '../helper/expression.js'
import { send } from '../helper/send.js'
import { Expression, Item, Key, Options } from '../types.js'

export interface QueryOptions extends Options {
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

export const query = async <T extends Item>(table:string, options:QueryOptions): Promise<QueryResponse<T>> => {
	const { forward = true } = options
	const command = new QueryCommand({
		TableName: table,
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

	const result = await send(command, options) as QueryCommandOutput

	return {
		count: result.Count || 0,
		items: result.Items as T[],
		cursor: result.LastEvaluatedKey
	}
}

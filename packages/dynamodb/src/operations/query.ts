
import { QueryCommand, QueryCommandOutput } from '@aws-sdk/lib-dynamodb'
import { addExpression } from '../helper/expression.js'
import { send } from '../helper/send.js'
import { Table } from '../table.js'
import { Expression, Item, Key, Options, ReturnModelType } from '../types.js'

export interface QueryOptions extends Options {
	keyCondition: Expression
	projection?: Expression
	index?: string
	consistentRead?: boolean
	limit?: number
	forward?: boolean
	cursor?: Key
}

export interface QueryResponse<I, T> {
	count: number
	items: ReturnModelType<I, T>[]
	cursor?: Key
}

export const query = async <I extends Item, T extends Table | string = string>(
	table: T,
	options:QueryOptions
): Promise<QueryResponse<I, T>> => {
	const { forward = true } = options
	const command = new QueryCommand({
		TableName: table.toString(),
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
		items: (result.Items || []) as ReturnModelType<I, T>[],
		cursor: result.LastEvaluatedKey
	}
}

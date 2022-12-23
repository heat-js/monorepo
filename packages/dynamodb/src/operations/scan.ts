
import { ScanCommand, ScanCommandOutput } from '@aws-sdk/lib-dynamodb'
import { addExpression } from '../helper/expression.js'
import { send } from '../helper/send.js'
import { Expression, Item, Key, Options } from '../types.js'

export interface ScanOptions extends Options {
	projection?: Expression
	index?: string
	consistentRead?: boolean
	limit?: number
	cursor?: Key
}

export interface ScanResponse<T extends Item> {
	count: number
	items: T[]
	cursor?: Key
}

export const scan = async <T extends Item>(table:string, options:ScanOptions = {}): Promise<ScanResponse<T>> => {
	const command = new ScanCommand({
		TableName: table,
		IndexName: options.index,
		ConsistentRead: options.consistentRead,
		Limit: options.limit || 10,
		ExclusiveStartKey: options.cursor,
	})

	if(options.projection) {
		command.input.ProjectionExpression = options.projection.expression
		addExpression(command.input, options.projection)
	}

	const result = await send(command, options) as ScanCommandOutput

	return {
		count: result.Count || 0,
		items: result.Items as T[],
		cursor: result.LastEvaluatedKey
	}
}


import { ScanCommand, ScanCommandOutput } from '@aws-sdk/lib-dynamodb'
import { addExpression } from '../helper/expression.js'
import { send } from '../helper/send.js'
import { Table } from '../table.js'
import { Expression, Item, Key, Options, ReturnModelType } from '../types.js'

export interface ScanOptions extends Options {
	projection?: Expression
	index?: string
	consistentRead?: boolean
	limit?: number
	cursor?: Key
}

export interface ScanResponse<I, T> {
	count: number
	items: ReturnModelType<I, T>[]
	cursor?: Key
}

export const scan = async <I extends Item, T extends Table | string = string>(
	table: T,
	options:ScanOptions = {}
): Promise<ScanResponse<I, T>> => {
	const command = new ScanCommand({
		TableName: table.toString(),
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
		items: result.Items as ReturnModelType<I, T>[],
		cursor: result.LastEvaluatedKey
	}
}

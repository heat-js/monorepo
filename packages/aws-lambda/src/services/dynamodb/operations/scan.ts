
import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import { addExpression } from '../helper/expression'
import { Table } from '../table'
import { Expression, Item, Key } from '../types'

export interface ScanOptions {
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

export const scan = async <T extends Item>(table:Table, options:ScanOptions = {}): Promise<ScanResponse<T>> => {
	const command = new ScanCommand({
		TableName: table.name,
		IndexName: options.index,
		ConsistentRead: options.consistentRead,
		Limit: options.limit || 10,
		ExclusiveStartKey: options.cursor,
	})

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

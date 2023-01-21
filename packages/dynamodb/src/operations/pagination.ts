
import { fromCursor, toCursor } from '../helper/cursor.js'
import { Table } from '../table.js'
import { Expression, Item, Options, ReturnModelType } from '../types.js'
import { query } from './query.js'

export interface PaginationOptions extends Options {
	keyCondition: Expression
	projection?: Expression
	index?: string
	consistentRead?: boolean
	limit?: number
	forward?: boolean
	cursor?: string
}

interface PaginationResponse<I, T> {
	count: number
	items: ReturnModelType<I, T>[]
	cursor?: string
}

export const pagination = async <I extends Item, T extends Table | string = string>(
	table: T,
	options:PaginationOptions
): Promise<PaginationResponse<I, T>> => {
	const result = await query<I, T>(table, {
		...options,
		cursor: options.cursor && fromCursor(options.cursor)
	})

	// FIX the problem where DynamoDB will return a cursor
	// even when no more items are available.

	if(result.cursor) {
		const more = await query<I, T>(table, {
			...options,
			limit: 1,
			cursor: result.cursor
		})

		if(more.count === 0) {
			delete result.cursor
		}
	}

	return {
		...result,
		cursor: result.cursor && toCursor(result.cursor)
	}
}

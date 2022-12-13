
import { fromCursor, toCursor } from '../helper/cursor.js'
import { Table } from '../table.js'
import { Expression, Item } from '../types.js'
import { query } from './query.js'

export interface PaginationOptions {
	keyCondition: Expression
	projection?: Expression
	index?: string
	consistentRead?: boolean
	limit?: number
	forward?: boolean
	cursor?: string
}

interface PaginationResponse<T> {
	count: number
	items: T[]
	cursor?: string
}

export const pagination = async <T extends Item>(table:Table, options:PaginationOptions): Promise<PaginationResponse<T>> => {
	const result = await query<T>(table, {
		...options,
		cursor: options.cursor && fromCursor(options.cursor)
	})

	return {
		...result,
		cursor: result.cursor && toCursor(result.cursor)
	}
}

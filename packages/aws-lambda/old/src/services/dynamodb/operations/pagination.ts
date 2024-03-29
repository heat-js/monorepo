
import { fromCursor, toCursor } from '../helper/cursor'
import { Table } from '../table'
import { Expression, Item } from '../types'
import { query } from './query'

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
		cursor: fromCursor(options.cursor)
	})

	return {
		...result,
		cursor: toCursor(result.cursor)
	}
}

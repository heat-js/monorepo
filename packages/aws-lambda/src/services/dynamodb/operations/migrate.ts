
import { Table } from '../table'
import { Item, Key } from '../types'
import { putItem } from './put-item'
import { scan } from './scan'

export interface MigrateOptions<OldItem, NewItem> {
	consistentRead?: boolean
	batch?: number
	transform: TransformCallback<OldItem, NewItem>
}

export interface TransformCallback<OldItem, NewItem> {
	(item:OldItem): NewItem | Promise<NewItem>
}

export interface MigrateResponse {
	itemsProcessed: number
}

export const migrate = async <OldItem extends Item, NewItem extends Item>(table:Table, options:MigrateOptions<OldItem, NewItem>): Promise<MigrateResponse> => {

	let cursor: Key
	let itemsProcessed = 0

	while(true) {
		const result = await scan<OldItem>(table, {
			consistentRead: options.consistentRead,
			limit: options.batch || 1000,
			cursor,
		})

		await Promise.all(result.items.map(async item => {
			const newItem = await options.transform(item)
			await putItem<NewItem>(table, newItem)
			itemsProcessed++
		}))

		if(result.items.length === 0 || !result.cursor) {
			break
		}

		cursor = result.cursor
	}

	return {
		itemsProcessed
	}
}

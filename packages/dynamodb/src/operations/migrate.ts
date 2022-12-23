
import { Item, Key, Options } from '../types.js'
import { putItem } from './put-item.js'
import { scan } from './scan.js'

export interface MigrateOptions<OldItem, NewItem> extends Options {
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

export const migrate = async <OldItem extends Item, NewItem extends Item>(table:string, options:MigrateOptions<OldItem, NewItem>): Promise<MigrateResponse> => {

	let cursor: Key
	let itemsProcessed = 0

	while(true) {
		const result = await scan<OldItem>(table, {
			client: options.client,
			consistentRead: options.consistentRead,
			limit: options.batch || 1000,
			// @ts-ignore
			cursor
		})

		await Promise.all(result.items.map(async item => {
			const newItem = await options.transform(item)
			await putItem<NewItem>(table, newItem, {
				client: options.client
			})

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

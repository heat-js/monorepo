
import { BatchGetCommand, BatchGetCommandOutput } from '@aws-sdk/lib-dynamodb'
import { Expression, Item, Options, ReturnKeyType, ReturnModelType } from '../types.js'
import { send } from '../helper/send.js'
import { Table } from '../table.js'

export interface BatchGetOptions<F extends boolean> extends Options {
	projection?: Expression
	consistentRead?: boolean
	filterNonExistentItems?: F
}

type BatchGetItem = {
	<I extends Item, T extends Table | string = string>(
		table:T,
		keys: ReturnKeyType<T>[],
		options?:BatchGetOptions<false>
	): Promise<(ReturnModelType<I, T> | undefined)[]>

	<I extends Item, T extends Table | string = string>(
		table:T,
		keys: ReturnKeyType<T>[],
		options?:BatchGetOptions<true>
	): Promise<ReturnModelType<I, T>[]>
}

export const batchGetItem:BatchGetItem = async <I extends Item, T extends Table | string = string>(
	table: T,
	keys: ReturnKeyType<T>[],
	options:BatchGetOptions<boolean> = { filterNonExistentItems: false }
): Promise<(ReturnModelType<I, T> | undefined)[]> => {
	let response: ReturnModelType<I, T>[] = []
	let unprocessedKeys: ReturnKeyType<T>[] = keys

	while(unprocessedKeys.length) {
		const command = new BatchGetCommand({
			RequestItems: {
				[ table.toString() ]: {
					Keys: unprocessedKeys,
					ConsistentRead: options.consistentRead,
					ExpressionAttributeNames: options.projection?.names,
					ProjectionExpression: options.projection?.expression,
				}
			}
		})

		const result = await send(command, options) as BatchGetCommandOutput

		unprocessedKeys = ( result.UnprocessedKeys?.[ table.toString() ]?.Keys || [] ) as ReturnKeyType<T>[]
		response = [ ...response, ...result.Responses?.[ table.toString() ] as ReturnModelType<I, T>[] ]
	}

	if(options.filterNonExistentItems) {
		return response
	}

	return keys.map(key => {
		return response.find(item => {
			for(const i in key) {
				if(key[i] !== item[i]) {
					return false
				}
			}

			return true
		})
	})
}

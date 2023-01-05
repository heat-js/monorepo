
import { BatchGetCommand, BatchGetCommandOutput } from '@aws-sdk/lib-dynamodb'
import { Expression, Item, Key, Options } from '../types.js'
import { send } from '../helper/send.js'

export interface BatchGetOptions<F extends boolean> extends Options {
	projection?: Expression
	consistentRead?: boolean
	filterNonExistentItems?: F
}

type BatchGetItem = {
	<T extends Item>(table:string, keys: Key[], options?:BatchGetOptions<false>): Promise<(T | undefined)[]>
	<T extends Item>(table:string, keys: Key[], options?:BatchGetOptions<true>): Promise<T[]>
}

export const batchGetItem:BatchGetItem = async <T extends Item>(table:string, keys: Key[], options:BatchGetOptions<true | false> = { filterNonExistentItems: false }): Promise<(T | undefined)[]> => {

	let response: T[] = []
	let unprocessedKeys: Key[] = keys

	while(unprocessedKeys.length) {
		const command = new BatchGetCommand({
			RequestItems: {
				[ table ]: {
					Keys: unprocessedKeys,
					ConsistentRead: options.consistentRead,
					ExpressionAttributeNames: options.projection?.names,
					ProjectionExpression: options.projection?.expression,
				}
			}
		})

		const result = await send(command, options) as BatchGetCommandOutput

		unprocessedKeys = result.UnprocessedKeys?.[ table ]?.Keys || [] as Key[]
		response = [ ...response, ...result.Responses?.[ table ] as T[] ]
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

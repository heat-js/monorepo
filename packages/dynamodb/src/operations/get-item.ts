
import { GetCommand, GetCommandOutput } from '@aws-sdk/lib-dynamodb'
import { Item, Key, Options } from '../types.js'
import { send } from '../helper/send.js'

export interface GetOptions extends Options {
	consistentRead?: boolean
}

export const getItem = async <T extends Item>(table: string, key: Key, options:GetOptions = {}): Promise<T | undefined> => {
	const command = new GetCommand({
		TableName: table,
		Key: key,
		ConsistentRead: options.consistentRead
	})

	const result = await send(command, options) as GetCommandOutput

	return result.Item as T | undefined
}

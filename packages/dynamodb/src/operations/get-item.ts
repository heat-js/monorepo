
import { GetCommand, GetCommandOutput } from '@aws-sdk/lib-dynamodb'
import { Item, Options, ReturnKeyType, ReturnModelType } from '../types.js'
import { send } from '../helper/send.js'
import { Table } from '../table.js'

export interface GetOptions extends Options {
	consistentRead?: boolean
}

export const getItem = async <I extends Item, T extends Table | string = string>(
	table: T,
	key: ReturnKeyType<T>,
	options:GetOptions = {}
): Promise<ReturnModelType<I, T> | undefined> => {
	const command = new GetCommand({
		TableName: table.toString(),
		Key: key,
		ConsistentRead: options.consistentRead
	})

	const result = await send(command, options) as GetCommandOutput

	return result.Item as ReturnModelType<I, T> | undefined
}

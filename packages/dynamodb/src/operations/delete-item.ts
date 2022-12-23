
import { DeleteCommand, DeleteCommandOutput } from '@aws-sdk/lib-dynamodb'
import { Item, Key, MutateOptions } from '../types.js'
import { extendMutateCommand } from '../helper/mutate.js'
import { send } from '../helper/send.js'

export interface DeleteOptions extends MutateOptions {}

export const deleteItem = async <T extends Item>(table: string, key: Key, options:DeleteOptions = {}): Promise<T | undefined> => {
	const command = new DeleteCommand({
		TableName: table,
		Key: key,
	})

	extendMutateCommand(command, options)

	const result = await send(command, options) as DeleteCommandOutput

	return result.Attributes as T | undefined
}

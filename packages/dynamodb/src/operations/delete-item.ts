
import { DeleteCommand, DeleteCommandOutput } from '@aws-sdk/lib-dynamodb'
import { Item, MutateOptions, ReturnKeyType, ReturnModelType } from '../types.js'
import { extendMutateCommand } from '../helper/mutate.js'
import { send } from '../helper/send.js'
import { Table } from '../table.js'

export interface DeleteOptions extends MutateOptions {}

export const deleteItem = async <I extends Item, T extends Table | string = string>(
	table: T,
	key: ReturnKeyType<T>,
	options:DeleteOptions = {}
): Promise<ReturnModelType<I, T> | undefined> => {
// export const deleteItem = async <T extends Item>(table: string, key: Key, options:DeleteOptions = {}): Promise<T | undefined> => {
	const command = new DeleteCommand({
		TableName: table.toString(),
		Key: key,
	})

	extendMutateCommand(command, options)

	const result = await send(command, options) as DeleteCommandOutput

	return result.Attributes as ReturnModelType<I, T> | undefined
}

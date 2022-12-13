
import { Table } from '../table.js'
import { DeleteCommand } from '@aws-sdk/lib-dynamodb'
import { Item, Key } from '../types.js'
import { extendMutateCommand, MutateOptions } from '../helper/mutate.js'

export interface DeleteOptions extends MutateOptions {}

export const deleteItem = async <T extends Item>(table: Table, key: Key, options:DeleteOptions = {}): Promise<T | undefined> => {
	const command = new DeleteCommand({
		TableName: table.name,
		Key: key,
	})

	extendMutateCommand(command, options)

	const result = await table.db.send(command)

	return result.Attributes as T | undefined
}

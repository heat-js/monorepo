
import { Table } from '../table.js'
import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { Item } from '../types.js'
import { extendMutateCommand, MutateOptions } from '../helper/mutate.js'

export interface PutOptions extends MutateOptions {}

export const putItem = async <T extends Item>(table: Table, item: T, options:PutOptions = {}): Promise<T | undefined> => {
	const command = new PutCommand({
		TableName: table.name,
		Item: item,
	})

	extendMutateCommand(command, options)

	const result = await table.db.send(command)

	return result.Attributes as T | undefined
}

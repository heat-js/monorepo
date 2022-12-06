
import { Table } from '../table'
import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { Item } from '../types'
import { extendMutateCommand, MutateOptions } from '../helper/mutate'

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
